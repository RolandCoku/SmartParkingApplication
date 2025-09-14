import { colors } from '@/constants/SharedStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomBar from '../components/BottomBar';

interface BookingDetails {
  id: string;
  locationName: string;
  address: string;
  spotNumber: string;
  bookingReference: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  price: string;
  status: 'active' | 'completed' | 'cancelled' | 'upcoming';
  vehicleInfo: {
    brand: string;
    model: string;
    licensePlate: string;
    color: string;
  };
  paymentMethod: {
    type: string;
    lastFour: string;
    brand: string;
  };
  features: string[];
  contactInfo: {
    phone: string;
    email: string;
  };
  createdAt: string;
  notes?: string;
}

export default function BookingDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [isLoading, setIsLoading] = useState(false);

  // Mock booking data - in real app, this would be fetched based on bookingId
  const bookingDetails: BookingDetails = {
    id: bookingId || '1',
    locationName: 'City Center Garage',
    address: '123 Main St, Downtown, NY 10001',
    spotNumber: 'A-12',
    bookingReference: 'PCK001234',
    date: 'Today',
    startTime: '2:30 PM',
    endTime: '4:30 PM',
    duration: '2 hours',
    price: '$5.00',
    status: 'active',
    vehicleInfo: {
      brand: 'Toyota',
      model: 'Camry',
      licensePlate: 'ABC-1234',
      color: 'Silver',
    },
    paymentMethod: {
      type: 'Credit Card',
      lastFour: '1234',
      brand: 'Visa',
    },
    features: ['Covered', 'Security', 'EV Charging'],
    contactInfo: {
      phone: '+1 (555) 123-4567',
      email: 'support@smartparking.com',
    },
    createdAt: 'Sep 13, 2024 at 2:15 PM',
    notes: 'Please park in the designated spot and ensure your vehicle is properly positioned.',
  };

  const handleNavigation = (key: 'home' | 'search' | 'available' | 'bookings' | 'profile') => {
    if (key === 'home') router.replace('/home');
    else if (key === 'search') router.push('/charging-map');
    else if (key === 'available') router.push('/available-spots');
    else if (key === 'bookings') router.push('/bookings');
    else if (key === 'profile') router.push('/profile');
  };

  const getStatusColor = (status: BookingDetails['status']) => {
    switch (status) {
      case 'active': return '#00C851';
      case 'upcoming': return colors.primary;
      case 'completed': return colors.textSecondary;
      case 'cancelled': return '#FF4444';
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: BookingDetails['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const handleExtendBooking = () => {
    Alert.alert(
      'Extend Booking',
      `Extend parking at ${bookingDetails.locationName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Extend +1 Hour', onPress: () => Alert.alert('Success', 'Booking extended by 1 hour') },
        { text: 'Extend +2 Hours', onPress: () => Alert.alert('Success', 'Booking extended by 2 hours') }
      ]
    );
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your booking at ${bookingDetails.locationName}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => Alert.alert('Cancelled', 'Your booking has been cancelled') }
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you\'d like to contact support:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Calling', `Calling ${bookingDetails.contactInfo.phone}`) },
        { text: 'Email', onPress: () => Alert.alert('Email', `Opening email to ${bookingDetails.contactInfo.email}`) }
      ]
    );
  };

  const handleGetDirections = () => {
    Alert.alert('Directions', 'Opening directions to parking location...');
  };

  const renderDetailRow = (icon: string, label: string, value: string, isLast = false) => (
    <View key={label} style={[styles.detailRow, isLast && styles.detailRowLast]}>
      <View style={styles.detailLeft}>
        <MaterialIcons name={icon as any} size={20} color={colors.primary} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Booking Details</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor(bookingDetails.status) }]}>
          <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
          <Text style={styles.statusText}>{getStatusText(bookingDetails.status)}</Text>
        </View>

        {/* Location Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Information</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <MaterialIcons name="location-on" size={24} color={colors.primary} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{bookingDetails.locationName}</Text>
                <Text style={styles.locationAddress}>{bookingDetails.address}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
              <MaterialIcons name="directions" size={20} color={colors.primary} />
              <Text style={styles.directionsText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Booking Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          <View style={styles.infoCard}>
            {renderDetailRow('receipt', 'Booking Reference', bookingDetails.bookingReference)}
            {renderDetailRow('calendar-today', 'Date', bookingDetails.date)}
            {renderDetailRow('access-time', 'Time', `${bookingDetails.startTime} - ${bookingDetails.endTime}`)}
            {renderDetailRow('schedule', 'Duration', bookingDetails.duration)}
            {renderDetailRow('local-parking', 'Spot Number', bookingDetails.spotNumber)}
            {renderDetailRow('attach-money', 'Total Price', bookingDetails.price, true)}
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <MaterialIcons name="directions-car" size={24} color={colors.primary} />
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>{bookingDetails.vehicleInfo.brand} {bookingDetails.vehicleInfo.model}</Text>
                <Text style={styles.vehicleDetails}>
                  {bookingDetails.vehicleInfo.licensePlate} • {bookingDetails.vehicleInfo.color}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <MaterialIcons name="payment" size={24} color={colors.primary} />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentType}>{bookingDetails.paymentMethod.type}</Text>
                <Text style={styles.paymentDetails}>
                  {bookingDetails.paymentMethod.brand} •••• {bookingDetails.paymentMethod.lastFour}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Features</Text>
          <View style={styles.featuresContainer}>
            {bookingDetails.features.map((feature, index) => (
              <View key={index} style={styles.featureTag}>
                <MaterialIcons name="check" size={16} color="#000000" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <View style={styles.infoCard}>
            {renderDetailRow('schedule', 'Created', bookingDetails.createdAt)}
            {bookingDetails.notes && (
              <View style={styles.notesContainer}>
                <MaterialIcons name="note" size={20} color={colors.primary} />
                <View style={styles.notesContent}>
                  <Text style={styles.notesLabel}>Notes</Text>
                  <Text style={styles.notesText}>{bookingDetails.notes}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {bookingDetails.status === 'active' && (
          <View style={styles.actionSection}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.extendButton]}
                onPress={handleExtendBooking}
              >
                <MaterialIcons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Extend</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelBooking}
              >
                <MaterialIcons name="cancel" size={20} color="#FF4444" />
                <Text style={[styles.actionButtonText, { color: '#FF4444' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Support Section */}
        <View style={styles.supportSection}>
          <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
            <MaterialIcons name="support-agent" size={20} color={colors.primary} />
            <Text style={styles.supportText}>Need Help? Contact Support</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
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
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  locationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationAddress: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 6,
  },
  directionsText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  detailValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  vehicleCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  vehicleDetails: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  paymentCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentType: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  paymentDetails: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  featureText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  notesContent: {
    flex: 1,
    marginLeft: 12,
  },
  notesLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  actionSection: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  extendButton: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  cancelButton: {
    borderColor: '#FF4444',
    backgroundColor: colors.background,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  supportSection: {
    marginBottom: 16,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  supportText: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});
