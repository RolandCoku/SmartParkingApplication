import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/constants/SharedStyles';

interface RecentBooking {
  id: string;
  location: string;
  date: string;
  duration: string;
  amount: string;
  status: 'completed' | 'active' | 'cancelled';
}

export default function RecentBookings() {
  const bookings: RecentBooking[] = [
    { id: '1', location: 'City Center Garage', date: 'Today', duration: '2h 30m', amount: '$7.50', status: 'active' },
    {
      id: '2',
      location: 'Mall Parking West',
      date: 'Yesterday',
      duration: '1h 45m',
      amount: '$5.25',
      status: 'completed'
    },
    {
      id: '3',
      location: 'Riverside Lot A',
      date: '2 days ago',
      duration: '3h 15m',
      amount: '$5.85',
      status: 'completed'
    },
  ];

  const getStatusColor = (status: RecentBooking['status']) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'completed':
        return colors.textSecondary;
      case 'cancelled':
        return '#FF4444';
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Bookings</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      {bookings.map((booking) => (
        <TouchableOpacity key={booking.id} style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <Text style={styles.bookingLocation}>{booking.location}</Text>
            <Text style={[styles.bookingStatus, { color: getStatusColor(booking.status) }]}>
              {booking.status.toUpperCase()}
            </Text>
          </View>
          <View style={styles.bookingDetails}>
            <Text style={styles.bookingDate}>{booking.date}</Text>
            <Text style={styles.bookingDuration}>{booking.duration}</Text>
            <Text style={styles.bookingAmount}>{booking.amount}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  seeAll: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookingLocation: { color: colors.text, fontSize: 16, fontWeight: '700' },
  bookingStatus: { fontSize: 12, fontWeight: '800' },
  bookingDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingDate: { color: colors.textSecondary, fontSize: 12 },
  bookingDuration: { color: colors.textSecondary, fontSize: 12 },
  bookingAmount: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});
