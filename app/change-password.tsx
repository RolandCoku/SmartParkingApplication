import { colors } from '@/constants/SharedStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthButton from '../components/AuthButton';
import FloatingLabelInput from '../components/FloatingLabelInput';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: keyof PasswordForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return false;
    }
    if (!formData.newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return false;
    }
    if (formData.newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('http://192.168.252.60:8080/api/v1/auth/change-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${await getAccessToken()}`
      //   },
      //   body: JSON.stringify({
      //     currentPassword: formData.currentPassword,
      //     newPassword: formData.newPassword
      //   })
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Success',
        'Password changed successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
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

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 'none', color: colors.textSecondary, text: '' };
    if (password.length < 6) return { strength: 'weak', color: '#FF4444', text: 'Weak' };
    if (password.length < 8) return { strength: 'fair', color: '#FFA500', text: 'Fair' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 'strong', color: '#4CAF50', text: 'Strong' };
    }
    return { strength: 'good', color: '#2196F3', text: 'Good' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Change Password</Text>
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
          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <MaterialIcons name="security" size={24} color={colors.primary} />
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Keep Your Account Secure</Text>
              <Text style={styles.securityText}>
                Use a strong password with at least 8 characters, including uppercase letters, numbers, and special characters.
              </Text>
            </View>
          </View>

          {/* Password Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Password Information</Text>
            
            <View style={styles.inputContainer}>
              <FloatingLabelInput
                label="Current Password"
                value={formData.currentPassword}
                onChangeText={(value) => handleInputChange('currentPassword', value)}
                placeholder="Enter your current password"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <MaterialIcons 
                  name={showCurrentPassword ? "visibility-off" : "visibility"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <FloatingLabelInput
                label="New Password"
                value={formData.newPassword}
                onChangeText={(value) => handleInputChange('newPassword', value)}
                placeholder="Enter your new password"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <MaterialIcons 
                  name={showNewPassword ? "visibility-off" : "visibility"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {/* Password Strength Indicator */}
            {formData.newPassword.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  <View 
                    style={[
                      styles.passwordStrengthFill,
                      { 
                        width: passwordStrength.strength === 'weak' ? '25%' : 
                               passwordStrength.strength === 'fair' ? '50%' :
                               passwordStrength.strength === 'good' ? '75%' : '100%',
                        backgroundColor: passwordStrength.color
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.text}
                </Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <FloatingLabelInput
                label="Confirm New Password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder="Confirm your new password"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialIcons 
                  name={showConfirmPassword ? "visibility-off" : "visibility"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {/* Password Match Indicator */}
            {formData.confirmPassword.length > 0 && (
              <View style={styles.passwordMatchContainer}>
                <MaterialIcons 
                  name={formData.newPassword === formData.confirmPassword ? "check-circle" : "error"} 
                  size={16} 
                  color={formData.newPassword === formData.confirmPassword ? "#4CAF50" : "#FF4444"} 
                />
                <Text style={[
                  styles.passwordMatchText,
                  { color: formData.newPassword === formData.confirmPassword ? "#4CAF50" : "#FF4444" }
                ]}>
                  {formData.newPassword === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            )}
          </View>

          {/* Password Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Password Requirements</Text>
            <View style={styles.requirementsList}>
              <View style={styles.requirementItem}>
                <MaterialIcons 
                  name={formData.newPassword.length >= 8 ? "check-circle" : "radio-button-unchecked"} 
                  size={16} 
                  color={formData.newPassword.length >= 8 ? "#4CAF50" : colors.textSecondary} 
                />
                <Text style={[
                  styles.requirementText,
                  { color: formData.newPassword.length >= 8 ? "#4CAF50" : colors.textSecondary }
                ]}>
                  At least 8 characters long
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <MaterialIcons 
                  name={/[A-Z]/.test(formData.newPassword) ? "check-circle" : "radio-button-unchecked"} 
                  size={16} 
                  color={/[A-Z]/.test(formData.newPassword) ? "#4CAF50" : colors.textSecondary} 
                />
                <Text style={[
                  styles.requirementText,
                  { color: /[A-Z]/.test(formData.newPassword) ? "#4CAF50" : colors.textSecondary }
                ]}>
                  Contains uppercase letter
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <MaterialIcons 
                  name={/[0-9]/.test(formData.newPassword) ? "check-circle" : "radio-button-unchecked"} 
                  size={16} 
                  color={/[0-9]/.test(formData.newPassword) ? "#4CAF50" : colors.textSecondary} 
                />
                <Text style={[
                  styles.requirementText,
                  { color: /[0-9]/.test(formData.newPassword) ? "#4CAF50" : colors.textSecondary }
                ]}>
                  Contains number
                </Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <AuthButton
              title="Change Password"
              onPress={handleChangePassword}
              loading={loading}
              variant="primary"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  securityNotice: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  securityContent: {
    flex: 1,
    marginLeft: 12,
  },
  securityTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  securityText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
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
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  passwordStrengthContainer: {
    marginBottom: 16,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 8,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  passwordMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordMatchText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  requirementsList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
