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

interface PaymentMethodForm {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: string;
  city: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function AddPaymentMethodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<PaymentMethodForm>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: 'United States',
    isDefault: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof PaymentMethodForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return digits.substring(0, 2) + '/' + digits.substring(2, 4);
    }
    return digits;
  };

  const validateForm = () => {
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Error', 'Please enter a valid card number');
      return false;
    }
    if (!formData.expiryDate || formData.expiryDate.length < 5) {
      Alert.alert('Error', 'Please enter a valid expiry date');
      return false;
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return false;
    }
    if (!formData.cardholderName.trim()) {
      Alert.alert('Error', 'Please enter the cardholder name');
      return false;
    }
    if (!formData.billingAddress.trim()) {
      Alert.alert('Error', 'Please enter the billing address');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Error', 'Please enter the city');
      return false;
    }
    if (!formData.zipCode.trim()) {
      Alert.alert('Error', 'Please enter the zip code');
      return false;
    }
    return true;
  };

  const handleSavePaymentMethod = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Payment method added successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/payment-methods'),
          },
        ]
      );
    }, 1500);
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Add Payment Method</Text>
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
          {/* Card Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Information</Text>
            
            <View style={styles.inputContainer}>
              <FloatingLabelInput
                label="Card Number"
                value={formData.cardNumber}
                onChangeText={(value) => handleInputChange('cardNumber', formatCardNumber(value))}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <FloatingLabelInput
                  label="Expiry Date"
                  value={formData.expiryDate}
                  onChangeText={(value) => handleInputChange('expiryDate', formatExpiryDate(value))}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <FloatingLabelInput
                  label="CVV"
                  value={formData.cvv}
                  onChangeText={(value) => handleInputChange('cvv', value.replace(/\D/g, ''))}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <FloatingLabelInput
                label="Cardholder Name"
                value={formData.cardholderName}
                onChangeText={(value) => handleInputChange('cardholderName', value)}
                placeholder="John Doe"
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Billing Address Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing Address</Text>
            
            <View style={styles.inputContainer}>
              <FloatingLabelInput
                label="Address"
                value={formData.billingAddress}
                onChangeText={(value) => handleInputChange('billingAddress', value)}
                placeholder="123 Main Street"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 2, marginRight: 8 }]}>
                <FloatingLabelInput
                  label="City"
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholder="New York"
                  autoCapitalize="words"
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <FloatingLabelInput
                  label="ZIP Code"
                  value={formData.zipCode}
                  onChangeText={(value) => handleInputChange('zipCode', value)}
                  placeholder="10001"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <FloatingLabelInput
                label="Country"
                value={formData.country}
                onChangeText={(value) => handleInputChange('country', value)}
                placeholder="United States"
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Default Payment Method Toggle */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.toggleContainer}
              onPress={() => handleInputChange('isDefault', !formData.isDefault)}
            >
              <View style={styles.toggleContent}>
                <View style={styles.toggleIcon}>
                  <MaterialIcons name="star" size={20} color={colors.primary} />
                </View>
                <View style={styles.toggleText}>
                  <Text style={styles.toggleTitle}>Set as Default Payment Method</Text>
                  <Text style={styles.toggleSubtitle}>This card will be used for future bookings</Text>
                </View>
              </View>
              <View style={[
                styles.toggleSwitch,
                formData.isDefault && styles.toggleSwitchActive
              ]}>
                <View style={[
                  styles.toggleThumb,
                  formData.isDefault && styles.toggleThumbActive
                ]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <MaterialIcons name="security" size={20} color={colors.primary} />
            <Text style={styles.securityText}>
              Your payment information is encrypted and secure. We never store your full card details.
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <AuthButton
            title="Save Payment Method"
            onPress={handleSavePaymentMethod}
            variant="primary"
            loading={isLoading}
          />
        </View>
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
  },
  row: {
    flexDirection: 'row',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  toggleSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  securityText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 12,
    flex: 1,
    lineHeight: 16,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 16,
  },
});
