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

interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  isDefault: boolean;
  registrationDate: string;
}

export default function MyVehiclesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      licensePlate: 'ABC-123',
      brand: 'Toyota',
      model: 'Camry',
      color: 'Silver',
      isDefault: true,
      registrationDate: '2024-01-15',
    },
    {
      id: '2',
      licensePlate: 'XYZ-789',
      brand: 'Honda',
      model: 'Civic',
      color: 'Blue',
      isDefault: false,
      registrationDate: '2024-02-20',
    },
    {
      id: '3',
      licensePlate: 'DEF-456',
      brand: 'Ford',
      model: 'Focus',
      color: 'Red',
      isDefault: false,
      registrationDate: '2024-03-10',
    },
  ]);

  const handleSetDefault = (vehicleId: string) => {
    setVehicles(prev => prev.map(vehicle => ({
      ...vehicle,
      isDefault: vehicle.id === vehicleId
    })));
    Alert.alert('Success', 'Default vehicle updated successfully!');
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    Alert.alert(
      'Delete Vehicle',
      `Are you sure you want to delete ${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setVehicles(prev => prev.filter(v => v.id !== vehicle.id));
            Alert.alert('Success', 'Vehicle deleted successfully!');
          }
        }
      ]
    );
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    router.push({
      pathname: '/edit-vehicle',
      params: {
        vehicleId: vehicle.id,
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        color: vehicle.color,
      }
    });
  };

  const renderVehicleCard = (vehicle: Vehicle) => (
    <View key={vehicle.id} style={styles.vehicleCard}>
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleInfo}>
          <View style={styles.vehicleTitleRow}>
            <Text style={styles.vehicleTitle}>{vehicle.brand} {vehicle.model}</Text>
            {vehicle.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.vehicleSubtitle}>{vehicle.licensePlate}</Text>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            Alert.alert(
              'Vehicle Options',
              `What would you like to do with ${vehicle.brand} ${vehicle.model}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Edit', onPress: () => handleEditVehicle(vehicle) },
                { text: 'Set as Default', onPress: () => handleSetDefault(vehicle.id) },
                { text: 'Delete', style: 'destructive', onPress: () => handleDeleteVehicle(vehicle) },
              ]
            );
          }}
        >
          <MaterialIcons name="more-vert" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.vehicleDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="palette" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{vehicle.color}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="calendar-today" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>Registered {new Date(vehicle.registrationDate).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.vehicleActions}>
        {!vehicle.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(vehicle.id)}
          >
            <MaterialIcons name="star-border" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditVehicle(vehicle)}
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
        <Text style={styles.headerTitle}>My Vehicles</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/register-vehicle')}
        >
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {vehicles.length > 0 ? (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{vehicles.length}</Text>
                <Text style={styles.statLabel}>Total Vehicles</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{vehicles.filter(v => v.isDefault).length}</Text>
                <Text style={styles.statLabel}>Default</Text>
              </View>
            </View>

            <View style={styles.vehiclesList}>
              {vehicles.map(renderVehicleCard)}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="directions-car" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Vehicles Registered</Text>
            <Text style={styles.emptySubtitle}>
              Add your first vehicle to make parking bookings easier
            </Text>
            <AuthButton
              title="Register Vehicle"
              onPress={() => router.push('/register-vehicle')}
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
  vehiclesList: {
    gap: 16,
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vehicleTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
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
  vehicleSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  moreButton: {
    padding: 4,
    borderRadius: 8,
  },
  vehicleDetails: {
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
  vehicleActions: {
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
