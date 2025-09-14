import { colors } from '@/constants/SharedStyles';
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

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  bookingUpdates: boolean;
  paymentReminders: boolean;
  promotionalOffers: boolean;
  parkingReminders: boolean;
  securityAlerts: boolean;
  quietHours: boolean;
  quietStartTime: string;
  quietEndTime: string;
}

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    bookingUpdates: true,
    paymentReminders: true,
    promotionalOffers: false,
    parkingReminders: true,
    securityAlerts: true,
    quietHours: false,
    quietStartTime: '22:00',
    quietEndTime: '08:00',
  });

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('http://192.168.252.60:8080/api/v1/user/notification-settings', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${await getAccessToken()}`
      //   },
      //   body: JSON.stringify(settings)
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'Success',
        'Notification preferences updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification preferences. Please try again.');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel? Your changes will be lost.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <MaterialIcons name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? '#FFFFFF' : colors.textSecondary}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Notification Preferences</Text>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <MaterialIcons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Overview</Text>
          <View style={styles.overviewCard}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>
                {Object.values(settings).filter(v => typeof v === 'boolean' && v).length}
              </Text>
              <Text style={styles.overviewLabel}>Active Notifications</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>
                {Object.values(settings).filter(v => typeof v === 'boolean' && !v).length}
              </Text>
              <Text style={styles.overviewLabel}>Disabled</Text>
            </View>
          </View>
        </View>

        {/* General Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Notifications</Text>
          <View style={styles.settingsCard}>
            {renderSettingItem(
              'Push Notifications',
              'Receive notifications on your device',
              settings.pushNotifications,
              (value) => handleSettingChange('pushNotifications', value),
              'notifications'
            )}
            <View style={styles.settingDivider} />
            {renderSettingItem(
              'Email Notifications',
              'Receive notifications via email',
              settings.emailNotifications,
              (value) => handleSettingChange('emailNotifications', value),
              'email'
            )}
            <View style={styles.settingDivider} />
            {renderSettingItem(
              'SMS Notifications',
              'Receive notifications via text message',
              settings.smsNotifications,
              (value) => handleSettingChange('smsNotifications', value),
              'sms'
            )}
          </View>
        </View>

        {/* Booking Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking & Parking</Text>
          <View style={styles.settingsCard}>
            {renderSettingItem(
              'Booking Updates',
              'Updates about your parking bookings',
              settings.bookingUpdates,
              (value) => handleSettingChange('bookingUpdates', value),
              'event'
            )}
            <View style={styles.settingDivider} />
            {renderSettingItem(
              'Parking Reminders',
              'Reminders before your parking expires',
              settings.parkingReminders,
              (value) => handleSettingChange('parkingReminders', value),
              'schedule'
            )}
            <View style={styles.settingDivider} />
            {renderSettingItem(
              'Payment Reminders',
              'Reminders for payment due dates',
              settings.paymentReminders,
              (value) => handleSettingChange('paymentReminders', value),
              'payment'
            )}
          </View>
        </View>

        {/* Marketing & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketing & Security</Text>
          <View style={styles.settingsCard}>
            {renderSettingItem(
              'Promotional Offers',
              'Special deals and promotional offers',
              settings.promotionalOffers,
              (value) => handleSettingChange('promotionalOffers', value),
              'local-offer'
            )}
            <View style={styles.settingDivider} />
            {renderSettingItem(
              'Security Alerts',
              'Important security notifications',
              settings.securityAlerts,
              (value) => handleSettingChange('securityAlerts', value),
              'security'
            )}
          </View>
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <View style={styles.settingsCard}>
            {renderSettingItem(
              'Enable Quiet Hours',
              'Pause notifications during specified hours',
              settings.quietHours,
              (value) => handleSettingChange('quietHours', value),
              'bedtime'
            )}
            
            {settings.quietHours && (
              <>
                <View style={styles.settingDivider} />
                <View style={styles.timeSettingsContainer}>
                  <View style={styles.timeSettingItem}>
                    <Text style={styles.timeSettingLabel}>Start Time</Text>
                    <TouchableOpacity style={styles.timeButton}>
                      <Text style={styles.timeButtonText}>{settings.quietStartTime}</Text>
                      <MaterialIcons name="access-time" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.timeSettingItem}>
                    <Text style={styles.timeSettingLabel}>End Time</Text>
                    <TouchableOpacity style={styles.timeButton}>
                      <Text style={styles.timeButtonText}>{settings.quietEndTime}</Text>
                      <MaterialIcons name="access-time" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  cancelButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
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
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  overviewLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  overviewDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 72,
  },
  timeSettingsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  timeSettingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeSettingLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  timeButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
