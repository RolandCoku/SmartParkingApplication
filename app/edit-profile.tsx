import { colors } from '@/constants/SharedStyles';
import { User } from '@/types';
import { ApiError, userApi } from '@/utils/api';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthButton from '../components/AuthButton';
import FloatingLabelInput from '../components/FloatingLabelInput';

interface ProfileForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setInitialLoading(true);
      const userData = await userApi.getCurrentUser();
      setUser(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        username: userData.username || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert('Error', `Failed to load user data: ${error.message}`);
      } else {
        Alert.alert('Error', 'Failed to load user data. Please try again.');
      }
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return false;
    }
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Please enter your username');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);
    try {
      const updatedUser = await userApi.updateUser(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      });

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert('Error', `Failed to update profile: ${error.message}`);
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
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

  const handlePasswordChange = async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setPasswordLoading(true);
    try {
      await userApi.changePassword(passwordData);
      Alert.alert(
        'Success',
        'Password changed successfully!',
        [
          {
            text: 'OK',
            onPress: () => setShowPasswordModal(false)
          }
        ]
      );
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert('Error', `Failed to change password: ${error.message}`);
      } else {
        Alert.alert('Error', 'Failed to change password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>Failed to Load Profile</Text>
          <Text style={styles.errorSubtitle}>Please try again later</Text>
          <AuthButton
            title="Go Back"
            onPress={() => router.back()}
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <MaterialIcons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Picture Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Picture</Text>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <MaterialIcons name="person" size={40} color={colors.primary} />
                </View>
                <TouchableOpacity style={styles.avatarEditButton}>
                  <MaterialIcons name="camera-alt" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.avatarInfo}>
                <Text style={styles.avatarTitle}>Update Profile Picture</Text>
                <Text style={styles.avatarSubtitle}>Tap to change your profile photo</Text>
              </View>
            </View>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputContainer}>
              <FloatingLabelInput
                label="First Name"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                placeholder="Enter your first name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <FloatingLabelInput
                label="Last Name"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                placeholder="Enter your last name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <FloatingLabelInput
                label="Username"
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                placeholder="Enter your username"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <FloatingLabelInput
                label="Email Address"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <FloatingLabelInput
                label="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>


          {/* Account Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            
            <View style={styles.settingsCard}>
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => setShowPasswordModal(true)}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <MaterialIcons name="lock" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Change Password</Text>
                    <Text style={styles.settingSubtitle}>Update your account password</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.settingDivider} />

              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => router.push('/notification-preferences')}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <MaterialIcons name="notifications" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Notification Preferences</Text>
                    <Text style={styles.settingSubtitle}>Manage your notification settings</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.settingDivider} />

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <MaterialIcons name="privacy-tip" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Privacy Settings</Text>
                    <Text style={styles.settingSubtitle}>Control your privacy and data</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <AuthButton
              title="Save Changes"
              onPress={handleSaveProfile}
              loading={loading}
              variant="primary"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Password Change Modal */}
      <PasswordChangeModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordChange}
        loading={passwordLoading}
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
  cancelButton: {
    padding: 8,
    borderRadius: 8,
  },
  keyboardView: {
    flex: 1,
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
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
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
  avatarInfo: {
    flex: 1,
  },
  avatarTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  avatarSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
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
  buttonContainer: {
    marginTop: 20,
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
});

// Password Change Modal Component
interface PasswordChangeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
  loading: boolean;
}

function PasswordChangeModal({ visible, onClose, onSubmit, loading }: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSubmit = () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match');
      return;
    }
    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    onSubmit({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswords({ current: false, new: false, confirm: false });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={passwordModalStyles.container}>
        <View style={passwordModalStyles.header}>
          <TouchableOpacity onPress={handleClose} style={passwordModalStyles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={passwordModalStyles.title}>Change Password</Text>
          <View style={passwordModalStyles.headerSpacer} />
        </View>

        <ScrollView style={passwordModalStyles.content} showsVerticalScrollIndicator={false}>
          <View style={passwordModalStyles.form}>
            <Text style={passwordModalStyles.description}>
              Enter your current password and choose a new secure password.
            </Text>

            <View style={passwordModalStyles.inputContainer}>
              <Text style={passwordModalStyles.label}>Current Password</Text>
              <View style={passwordModalStyles.passwordInput}>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.textSecondary}
                  style={passwordModalStyles.input}
                  secureTextEntry={!showPasswords.current}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  style={passwordModalStyles.eyeButton}
                >
                  <MaterialIcons
                    name={showPasswords.current ? "visibility" : "visibility-off"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={passwordModalStyles.inputContainer}>
              <Text style={passwordModalStyles.label}>New Password</Text>
              <View style={passwordModalStyles.passwordInput}>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.textSecondary}
                  style={passwordModalStyles.input}
                  secureTextEntry={!showPasswords.new}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  style={passwordModalStyles.eyeButton}
                >
                  <MaterialIcons
                    name={showPasswords.new ? "visibility" : "visibility-off"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <Text style={passwordModalStyles.helpText}>
                Password must be at least 8 characters long
              </Text>
            </View>

            <View style={passwordModalStyles.inputContainer}>
              <Text style={passwordModalStyles.label}>Confirm New Password</Text>
              <View style={passwordModalStyles.passwordInput}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.textSecondary}
                  style={passwordModalStyles.input}
                  secureTextEntry={!showPasswords.confirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  style={passwordModalStyles.eyeButton}
                >
                  <MaterialIcons
                    name={showPasswords.confirm ? "visibility" : "visibility-off"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={passwordModalStyles.buttonContainer}>
              <AuthButton
                title="Change Password"
                onPress={handleSubmit}
                loading={loading}
                variant="primary"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const passwordModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 8,
  },
  helpText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
