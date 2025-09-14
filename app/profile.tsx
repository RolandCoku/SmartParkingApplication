import { colors } from '@/constants/SharedStyles';
import { logout } from '@/utils/auth';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
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
  id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  totalBookings: number;
  totalSpent: string;
  points: number;
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
  const [locationEnabled, setLocationEnabled] = useState(true);

  // Mock user data
  const userProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    memberSince: 'January 2024',
    totalBookings: 47,
    totalSpent: '$234.50',
    points: 1247,
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
    Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
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
      onPress: () => setLocationEnabled(!locationEnabled),
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
              <Text style={styles.statValue}>{userProfile.totalSpent}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
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
});
