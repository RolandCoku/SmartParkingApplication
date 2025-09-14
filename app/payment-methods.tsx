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
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthButton from '../components/AuthButton';

interface PaymentMethod {
  id: string;
  cardNumber: string;
  expiryDate: string;
  cardholderName: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'discover';
  isDefault: boolean;
  addedDate: string;
}

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      cardNumber: '**** **** **** 1234',
      expiryDate: '12/25',
      cardholderName: 'John Doe',
      brand: 'visa',
      isDefault: true,
      addedDate: '2024-01-15',
    },
    {
      id: '2',
      cardNumber: '**** **** **** 5678',
      expiryDate: '08/26',
      cardholderName: 'John Doe',
      brand: 'mastercard',
      isDefault: false,
      addedDate: '2024-02-20',
    },
  ]);

  const getBrandIcon = (brand: PaymentMethod['brand']) => {
    switch (brand) {
      case 'visa':
        return 'credit-card';
      case 'mastercard':
        return 'credit-card';
      case 'amex':
        return 'credit-card';
      case 'discover':
        return 'credit-card';
      default:
        return 'credit-card';
    }
  };

  const getBrandColor = (brand: PaymentMethod['brand']) => {
    switch (brand) {
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      case 'amex':
        return '#006FCF';
      case 'discover':
        return '#FF6000';
      default:
        return colors.textSecondary;
    }
  };

  const handleSetDefault = (paymentMethodId: string) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === paymentMethodId
    })));
    Alert.alert('Success', 'Default payment method updated successfully!');
  };

  const handleDeletePaymentMethod = (paymentMethod: PaymentMethod) => {
    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete the ${paymentMethod.brand.toUpperCase()} card ending in ${paymentMethod.cardNumber.slice(-4)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(method => method.id !== paymentMethod.id));
            Alert.alert('Success', 'Payment method deleted successfully!');
          }
        }
      ]
    );
  };

  const handleEditPaymentMethod = (paymentMethod: PaymentMethod) => {
    Alert.alert('Edit Payment Method', 'Payment method editing feature coming soon!');
  };

  const renderPaymentMethodCard = (paymentMethod: PaymentMethod) => (
    <View key={paymentMethod.id} style={styles.paymentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <View style={styles.cardTitleRow}>
            <View style={styles.cardBrand}>
              <MaterialIcons 
                name={getBrandIcon(paymentMethod.brand)} 
                size={24} 
                color={getBrandColor(paymentMethod.brand)} 
              />
              <Text style={styles.cardBrandText}>{paymentMethod.brand.toUpperCase()}</Text>
            </View>
            {paymentMethod.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardNumber}>{paymentMethod.cardNumber}</Text>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            Alert.alert(
              'Payment Method Options',
              `What would you like to do with this ${paymentMethod.brand.toUpperCase()} card?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Edit', onPress: () => handleEditPaymentMethod(paymentMethod) },
                { text: 'Set as Default', onPress: () => handleSetDefault(paymentMethod.id) },
                { text: 'Delete', style: 'destructive', onPress: () => handleDeletePaymentMethod(paymentMethod) },
              ]
            );
          }}
        >
          <MaterialIcons name="more-vert" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="person" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{paymentMethod.cardholderName}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="event" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>Expires {paymentMethod.expiryDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="calendar-today" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>Added {new Date(paymentMethod.addedDate).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        {!paymentMethod.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(paymentMethod.id)}
          >
            <MaterialIcons name="star-border" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditPaymentMethod(paymentMethod)}
        >
          <MaterialIcons name="edit" size={16} color={colors.textSecondary} />
          <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-payment-method')}
        >
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {paymentMethods.length > 0 ? (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{paymentMethods.length}</Text>
                <Text style={styles.statLabel}>Total Cards</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{paymentMethods.filter(method => method.isDefault).length}</Text>
                <Text style={styles.statLabel}>Default</Text>
              </View>
            </View>

            <View style={styles.paymentMethodsList}>
              {paymentMethods.map(renderPaymentMethodCard)}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="credit-card" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Payment Methods</Text>
            <Text style={styles.emptySubtitle}>
              Add your first payment method to make bookings easier
            </Text>
            <AuthButton
              title="Add Payment Method"
              onPress={() => router.push('/add-payment-method')}
              variant="primary"
            />
          </View>
        )}
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
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: 24,
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
  paymentMethodsList: {
    gap: 16,
  },
  paymentCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  cardBrandText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  defaultBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },
  cardNumber: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  moreButton: {
    padding: 4,
    borderRadius: 8,
  },
  cardDetails: {
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
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    gap: 4,
  },
  editButton: {
    borderColor: colors.border,
  },
  actionButtonText: {
    color: colors.primary,
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
    lineHeight: 20,
  },
});
