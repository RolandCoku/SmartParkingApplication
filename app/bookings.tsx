import BottomBar from '@/components/BottomBar';
import { colors } from '@/constants/SharedStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Booking {
  id: string;
  locationName: string;
  address: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  price: string;
  status: 'active' | 'completed' | 'cancelled' | 'upcoming';
  spotNumber: string;
  bookingReference: string;
}

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigation = (key: 'home' | 'search' | 'available' | 'bookings' | 'profile') => {
    if (key === 'bookings') return; // Already on bookings

    // Navigate immediately without loading states
    if (key === 'home') router.replace('/home');
    else if (key === 'search') router.push('/charging-map');
    else if (key === 'available') router.push('/available-spots');
    else if (key === 'profile') router.push('/profile');
  };

  // Dummy booking data
  const bookings: Booking[] = [
    {
      id: '1',
      locationName: 'City Center Garage',
      address: '123 Main St, Downtown',
      date: 'Today',
      startTime: '2:30 PM',
      endTime: '4:30 PM',
      duration: '2 hours',
      price: '$5.00',
      status: 'active',
      spotNumber: 'A-12',
      bookingReference: 'PCK001234'
    },
    {
      id: '2',
      locationName: 'Mall Parking West',
      address: '456 Shopping Blvd',
      date: 'Tomorrow',
      startTime: '10:00 AM',
      endTime: '2:00 PM',
      duration: '4 hours',
      price: '$12.00',
      status: 'upcoming',
      spotNumber: 'B-07',
      bookingReference: 'PCK001235'
    },
    {
      id: '3',
      locationName: 'Riverside Lot A',
      address: '789 River Ave',
      date: 'Sep 8',
      startTime: '9:00 AM',
      endTime: '11:00 AM',
      duration: '2 hours',
      price: '$3.60',
      status: 'completed',
      spotNumber: 'C-23',
      bookingReference: 'PCK001230'
    },
    {
      id: '4',
      locationName: 'Underground C-12',
      address: '321 Business District',
      date: 'Sep 5',
      startTime: '1:00 PM',
      endTime: '5:00 PM',
      duration: '4 hours',
      price: '$8.80',
      status: 'completed',
      spotNumber: 'D-15',
      bookingReference: 'PCK001228'
    },
    {
      id: '5',
      locationName: 'Street Parking Zone',
      address: '654 Central Park',
      date: 'Sep 3',
      startTime: '11:30 AM',
      endTime: '12:30 PM',
      duration: '1 hour',
      price: '$1.00',
      status: 'cancelled',
      spotNumber: 'E-02',
      bookingReference: 'PCK001225'
    }
  ];

  const currentBookings = bookings.filter(b => {
    const matchesStatus = b.status === 'active' || b.status === 'upcoming';
    if (!matchesStatus) return false;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return b.locationName.toLowerCase().includes(query) ||
             b.address.toLowerCase().includes(query) ||
             b.spotNumber.toLowerCase().includes(query) ||
             b.bookingReference.toLowerCase().includes(query);
    }
    return true;
  });
  
  const historyBookings = bookings.filter(b => {
    const matchesStatus = b.status === 'completed' || b.status === 'cancelled';
    if (!matchesStatus) return false;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return b.locationName.toLowerCase().includes(query) ||
             b.address.toLowerCase().includes(query) ||
             b.spotNumber.toLowerCase().includes(query) ||
             b.bookingReference.toLowerCase().includes(query);
    }
    return true;
  });

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'active': return '#00C851';
      case 'upcoming': return colors.primary;
      case 'completed': return colors.textSecondary;
      case 'cancelled': return '#FF4444';
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const handleExtendBooking = (booking: Booking) => {
    Alert.alert(
      'Extend Booking',
      `Extend parking at ${booking.locationName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Extend +1 Hour', onPress: () => Alert.alert('Success', 'Booking extended by 1 hour') },
        { text: 'Extend +2 Hours', onPress: () => Alert.alert('Success', 'Booking extended by 2 hours') }
      ]
    );
  };

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your booking at ${booking.locationName}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => Alert.alert('Cancelled', 'Your booking has been cancelled') }
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
          <Text style={styles.locationName}>{booking.locationName}</Text>
          <Text style={styles.address}>{booking.address}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="calendar-today" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{booking.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="access-time" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{booking.startTime} - {booking.endTime}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="local-parking" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>Spot {booking.spotNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="receipt" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{booking.bookingReference}</Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.duration}>{booking.duration}</Text>
          <Text style={styles.price}>{booking.price}</Text>
        </View>

        {booking.status === 'active' && (
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

        {booking.status === 'upcoming' && (
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

        {booking.status === 'completed' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rebookButton]}
              onPress={() => Alert.alert('Rebook', `Rebook parking at ${booking.locationName}?`)}
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
            Current ({currentBookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History ({historyBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'current' ? (
          currentBookings.length > 0 ? (
            currentBookings.map(renderBookingCard)
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
          historyBookings.length > 0 ? (
            historyBookings.map(renderBookingCard)
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
