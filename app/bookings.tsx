import BottomBar from '@/components/BottomBar';
import { colors } from '@/constants/SharedStyles';
import { Booking } from '@/types';
import { bookingsApi } from '@/utils/api';
import { isSessionExpiredError } from '@/utils/auth';
import { ApiError } from '@/utils/errors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Remove the local Booking interface since we're importing it from types

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      
      // Load current bookings (active and upcoming)
      const currentResponse = await bookingsApi.getCurrentBookings(0, 50);
      setCurrentBookings(currentResponse.content || []);
      
      // Load booking history (completed and cancelled)
      const historyResponse = await bookingsApi.getBookingHistory(0, 50);
      setHistoryBookings(historyResponse.content || []);
      
    } catch (error) {
      if (isSessionExpiredError(error)) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login')
            }
          ]
        );
      } else if (error instanceof ApiError) {
        Alert.alert('Error', `Failed to load bookings: ${error.message}`);
      } else {
        Alert.alert('Error', 'Failed to load bookings. Please try again.');
      }
      // Set empty arrays on error
      setCurrentBookings([]);
      setHistoryBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleNavigation = (key: 'home' | 'search' | 'available' | 'bookings' | 'profile') => {
    if (key === 'bookings') return; // Already on bookings

    // Navigate immediately without loading states
    if (key === 'home') router.replace('/home');
    else if (key === 'search') router.push('/charging-map');
    else if (key === 'available') router.push('/available-spots');
    else if (key === 'profile') router.push('/profile');
  };

  // Filter bookings based on search query
  const filteredCurrentBookings = currentBookings.filter(booking => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return booking.parkingLotName.toLowerCase().includes(query) ||
           booking.parkingLotAddress.toLowerCase().includes(query) ||
           booking.parkingSpaceLabel.toLowerCase().includes(query) ||
           booking.bookingReference.toLowerCase().includes(query);
  });
  
  const filteredHistoryBookings = historyBookings.filter(booking => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return booking.parkingLotName.toLowerCase().includes(query) ||
           booking.parkingLotAddress.toLowerCase().includes(query) ||
           booking.parkingSpaceLabel.toLowerCase().includes(query) ||
           booking.bookingReference.toLowerCase().includes(query);
  });

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'ACTIVE': return '#00C851';
      case 'CONFIRMED': return colors.primary;
      case 'PENDING': return '#FF9800';
      case 'COMPLETED': return colors.textSecondary;
      case 'CANCELLED': return '#FF4444';
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'CONFIRMED': return 'Confirmed';
      case 'PENDING': return 'Pending';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  const formatBookingDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleExtendBooking = async (booking: Booking) => {
    Alert.alert(
      'Extend Booking',
      `Extend parking at ${booking.parkingLotName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Extend +1 Hour', 
          onPress: async () => {
            try {
              const newEndTime = new Date(booking.endTime);
              newEndTime.setHours(newEndTime.getHours() + 1);
              await bookingsApi.extendBooking(booking.id, newEndTime.toISOString());
              Alert.alert('Success', 'Booking extended by 1 hour');
              loadBookings(); // Refresh the list
            } catch (error) {
              if (isSessionExpiredError(error)) {
                Alert.alert(
                  'Session Expired',
                  'Your session has expired. Please login again.',
                  [
                    {
                      text: 'OK',
                      onPress: () => router.replace('/login')
                    }
                  ]
                );
              } else {
                Alert.alert('Error', 'Failed to extend booking. Please try again.');
              }
            }
          }
        },
        { 
          text: 'Extend +2 Hours', 
          onPress: async () => {
            try {
              const newEndTime = new Date(booking.endTime);
              newEndTime.setHours(newEndTime.getHours() + 2);
              await bookingsApi.extendBooking(booking.id, newEndTime.toISOString());
              Alert.alert('Success', 'Booking extended by 2 hours');
              loadBookings(); // Refresh the list
            } catch (error) {
              if (isSessionExpiredError(error)) {
                Alert.alert(
                  'Session Expired',
                  'Your session has expired. Please login again.',
                  [
                    {
                      text: 'OK',
                      onPress: () => router.replace('/login')
                    }
                  ]
                );
              } else {
                Alert.alert('Error', 'Failed to extend booking. Please try again.');
              }
            }
          }
        }
      ]
    );
  };

  const handleCancelBooking = async (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your booking at ${booking.parkingLotName}?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await bookingsApi.cancelBooking(booking.id);
              Alert.alert('Cancelled', 'Your booking has been cancelled');
              loadBookings(); // Refresh the list
            } catch (error) {
              if (isSessionExpiredError(error)) {
                Alert.alert(
                  'Session Expired',
                  'Your session has expired. Please login again.',
                  [
                    {
                      text: 'OK',
                      onPress: () => router.replace('/login')
                    }
                  ]
                );
              } else {
                Alert.alert('Error', 'Failed to cancel booking. Please try again.');
              }
            }
          }
        }
      ]
    );
  };

  const renderBookingCard = (booking: Booking) => (
    <TouchableOpacity 
      key={booking.id} 
      style={styles.bookingCard}
      onPress={() => router.push(`/booking-details?bookingId=${booking.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.locationName}>{booking.parkingLotName}</Text>
          <Text style={styles.address}>{booking.parkingLotAddress}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="calendar-today" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{formatBookingDate(booking.startTime)}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="access-time" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="local-parking" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>Spot {booking.parkingSpaceLabel}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="receipt" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{booking.bookingReference}</Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.duration}>{calculateDuration(booking.startTime, booking.endTime)}</Text>
          <Text style={styles.price}>{booking.currency} {booking.totalPrice}</Text>
        </View>

        {booking.status === 'ACTIVE' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.extendButton]}
              onPress={() => handleExtendBooking(booking)}
            >
              <MaterialIcons name="add-circle-outline" size={16} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>Extend</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelBooking(booking)}
            >
              <MaterialIcons name="cancel" size={16} color="#FF4444" />
              <Text style={[styles.actionButtonText, { color: '#FF4444' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelBooking(booking)}
            >
              <MaterialIcons name="cancel" size={16} color="#FF4444" />
              <Text style={[styles.actionButtonText, { color: '#FF4444' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {booking.status === 'COMPLETED' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rebookButton]}
              onPress={() => Alert.alert('Rebook', `Rebook parking at ${booking.parkingLotName}?`)}
            >
              <MaterialIcons name="refresh" size={16} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>Rebook</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search bookings, locations..."
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <MaterialIcons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'current' && styles.activeTab]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
            Current ({filteredCurrentBookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History ({filteredHistoryBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading bookings...</Text>
          </View>
        ) : activeTab === 'current' ? (
          filteredCurrentBookings.length > 0 ? (
            filteredCurrentBookings.map(renderBookingCard)
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-busy" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Current Bookings</Text>
              <Text style={styles.emptySubtitle}>Your active and upcoming bookings will appear here</Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.replace('/available-spots')}
              >
                <Text style={styles.exploreButtonText}>Find Parking</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          filteredHistoryBookings.length > 0 ? (
            filteredHistoryBookings.map(renderBookingCard)
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="history" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Booking History</Text>
              <Text style={styles.emptySubtitle}>Your completed bookings will appear here</Text>
            </View>
          )
        )}
      </ScrollView>

      <BottomBar
        activeKey="bookings"
        onPressItem={handleNavigation}
        bottomInset={insets.bottom - 14}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
    borderRadius: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  locationName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  address: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: colors.text,
    fontSize: 14,
    marginLeft: 8,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  duration: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  price: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  extendButton: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  cancelButton: {
    borderColor: '#FF4444',
    backgroundColor: colors.background,
  },
  rebookButton: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
});
