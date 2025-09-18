import { colors } from '@/constants/SharedStyles';
import { Booking, ParkingSession, UserCar } from '@/types';
import { bookingsApi, sessionsApi, userApi } from '@/utils/api';
import { logout } from '@/utils/auth';
import { ApiError } from '@/utils/errors';
import { locationService } from '@/utils/location';
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
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthButton from '../components/AuthButton';
import BottomBar from '../components/BottomBar';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  totalBookings: number;
  totalSpent: number;
  totalSessions: number;
  avatar?: string;
}

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(locationService.isLocationEnabled());
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userCars, setUserCars] = useState<UserCar[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentSessions, setRecentSessions] = useState<ParkingSession[]>([]);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load user data
      const user = await userApi.getCurrentUser();
      
      // Load user cars
      const carsResponse = await userApi.getUserCars(0, 5);
      
      // Load recent bookings
      const bookingsResponse = await bookingsApi.getUserBookings(0, 5);
      
      // Load recent sessions
      const sessionsResponse = await sessionsApi.getUserSessions(0, 5);
      
      // Calculate totals
      const totalBookings = bookingsResponse.totalElements || 0;
      const totalSessions = sessionsResponse.totalElements || 0;
      const totalSpent = (bookingsResponse.content || []).reduce((sum, booking) => sum + (booking.totalPrice || 0), 0) +
                        (sessionsResponse.content || []).reduce((sum, session) => sum + (session.billedAmount || 0), 0);
      
      setUserProfile({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phoneNumber,
        memberSince: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalBookings,
        totalSpent,
        totalSessions,
      });
      
      setUserCars(carsResponse.content || []);
      setRecentBookings(bookingsResponse.content || []);
      setRecentSessions(sessionsResponse.content || []);
      
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.message.includes('Session expired') || error.message.includes('Please login again')) {
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
          Alert.alert('Error', `Failed to load profile: ${error.message}`);
        }
      } else if (error instanceof Error && error.message.includes('Session expired')) {
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
        Alert.alert('Error', 'Failed to load profile data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (key: 'home' | 'search' | 'available' | 'bookings' | 'profile') => {
    if (key === 'profile') return; // Already on profile

    if (key === 'home') router.replace('/home');
    else if (key === 'search') router.push('/charging-map');
    else if (key === 'available') router.push('/available-spots');
    else if (key === 'bookings') router.push('/bookings');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handlePaymentMethods = () => {
    router.push('/payment-methods');
  };

  const handleVehicleManagement = () => {
    router.push('/my-vehicles');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Support feature coming soon!');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Privacy policy feature coming soon!');
  };

  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'Terms of service feature coming soon!');
  };

  const settingsItems: SettingsItem[] = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Receive booking updates and reminders',
      icon: 'notifications',
      type: 'toggle',
      value: notificationsEnabled,
      onPress: () => setNotificationsEnabled(!notificationsEnabled),
    },
    {
      id: 'location',
      title: 'Location Services',
      subtitle: 'Allow access to your location for better recommendations',
      icon: 'location-on',
      type: 'toggle',
      value: locationEnabled,
      onPress: () => {
        const newValue = !locationEnabled;
        setLocationEnabled(newValue);
        locationService.setLocationEnabled(newValue);
        
        if (!newValue) {
          Alert.alert(
            'Location Services Disabled',
            'Location-based features like nearby parking spots and navigation will be disabled. You can re-enable this anytime in settings.',
            [{ text: 'OK' }]
          );
        }
      },
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      subtitle: 'Manage your saved payment methods',
      icon: 'payment',
      type: 'navigation',
      onPress: handlePaymentMethods,
    },
    {
      id: 'vehicles',
      title: 'My Vehicles',
      subtitle: 'Manage your registered vehicles',
      icon: 'directions-car',
      type: 'navigation',
      onPress: handleVehicleManagement,
    },
    {
      id: 'support',
      title: 'Help & Support',
      subtitle: 'Get help or contact support',
      icon: 'help',
      type: 'navigation',
      onPress: handleSupport,
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'privacy-tip',
      type: 'navigation',
      onPress: handlePrivacyPolicy,
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: 'description',
      type: 'navigation',
      onPress: handleTermsOfService,
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingsItem}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingsItemLeft}>
          <View style={styles.settingsIcon}>
            <MaterialIcons name={item.icon as any} size={24} color={colors.primary} />
          </View>
          <View style={styles.settingsContent}>
            <Text style={styles.settingsTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingsSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onPress}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={item.value ? '#FFFFFF' : colors.textSecondary}
          />
        ) : (
          <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>Failed to Load Profile</Text>
          <Text style={styles.errorSubtitle}>Please try again later</Text>
          <AuthButton
            title="Retry"
            onPress={loadProfileData}
            variant="primary"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
          <MaterialIcons name="edit" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadProfileData}
            tintColor={colors.primary}
          />
        }
      >
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={40} color={colors.primary} />
            </View>
            <TouchableOpacity style={styles.avatarEditButton}>
              <MaterialIcons name="camera-alt" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userEmail}>{userProfile.email}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile.totalBookings}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile.totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${userProfile.totalSpent.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="email" size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userProfile.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{userProfile.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="calendar-today" size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>{userProfile.memberSince}</Text>
            </View>
          </View>
        </View>

        {/* My Vehicles */}
        {userCars.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Vehicles</Text>
              <TouchableOpacity onPress={() => router.push('/my-vehicles')}>
                <Text style={styles.seeAll}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.carsCard}>
              {userCars.slice(0, 3).map((car) => (
                <View key={car.id} style={styles.carItem}>
                  <View style={styles.carInfo}>
                    <Text style={styles.carPlate}>{car.licensePlate}</Text>
                    <Text style={styles.carDetails}>{car.brand} {car.model}</Text>
                    <Text style={styles.carColor}>{car.color}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            {recentBookings.length > 0 && (
              <View style={styles.activitySection}>
                <Text style={styles.activityTitle}>Recent Bookings</Text>
                {recentBookings.slice(0, 2).map((booking) => (
                  <View key={booking.id} style={styles.activityItem}>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityLocation}>{booking.parkingLotName}</Text>
                      <Text style={styles.activityDate}>
                        {new Date(booking.startTime).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.activityStatus}>
                      {booking.status}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {recentSessions.length > 0 && (
              <View style={styles.activitySection}>
                <Text style={styles.activityTitle}>Recent Sessions</Text>
                {recentSessions.slice(0, 2).map((session) => (
                  <View key={session.id} style={styles.activityItem}>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityLocation}>{session.parkingLotName}</Text>
                      <Text style={styles.activityDate}>
                        {new Date(session.startedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.activityStatus}>
                      {session.status}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {recentBookings.length === 0 && recentSessions.length === 0 && (
              <View style={styles.emptyActivity}>
                <MaterialIcons name="history" size={32} color={colors.textSecondary} />
                <Text style={styles.emptyActivityText}>No recent activity</Text>
                <Text style={styles.emptyActivitySubtext}>
                  Start booking parking spots to see your activity here
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            {settingsItems.map(renderSettingsItem)}
          </View>
        </View>


        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <AuthButton
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
          />
        </View>
      </ScrollView>

      <BottomBar
        activeKey="profile"
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
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  userName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  infoValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingsSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  logoutSection: {
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  carsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  carItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  carInfo: {
    flex: 1,
  },
  carPlate: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  carDetails: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 2,
  },
  carColor: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  activitySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityLocation: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDate: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  activityStatus: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyActivity: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyActivityText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  emptyActivitySubtext: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.7,
  },
});
