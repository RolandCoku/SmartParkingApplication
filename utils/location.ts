import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: Location.LocationPermissionResponse['status'];
}

class LocationService {
  private static instance: LocationService;
  private isEnabled: boolean = true;
  private permissionStatus: LocationPermissionStatus | null = null;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Check if location services are enabled in app settings
  isLocationEnabled(): boolean {
    return this.isEnabled;
  }

  // Enable/disable location services in app settings
  setLocationEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.permissionStatus = null;
    }
  }

  // Get current permission status
  async getPermissionStatus(): Promise<LocationPermissionStatus | null> {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
      this.permissionStatus = {
        granted: status === 'granted',
        canAskAgain,
        status
      };
      return this.permissionStatus;
    } catch (error) {
      console.error('[LOCATION] Error getting permission status:', error);
      return null;
    }
  }

  // Request location permission
  async requestPermission(): Promise<LocationPermissionStatus | null> {
    if (!this.isEnabled) {
      Alert.alert(
        'Location Services Disabled',
        'Please enable location services in your profile settings to use location-based features.',
        [{ text: 'OK' }]
      );
      return null;
    }

    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      this.permissionStatus = {
        granted: status === 'granted',
        canAskAgain,
        status
      };

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Location access is required for parking recommendations and navigation features.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.openSettingsAsync() }
          ]
        );
      }

      return this.permissionStatus;
    } catch (error) {
      console.error('[LOCATION] Error requesting permission:', error);
      return null;
    }
  }

  // Get current location
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    if (!this.isEnabled) {
      Alert.alert(
        'Location Services Disabled',
        'Please enable location services in your profile settings to get your current location.',
        [{ text: 'OK' }]
      );
      return null;
    }

    const permission = await this.getPermissionStatus();
    if (!permission?.granted) {
      const newPermission = await this.requestPermission();
      if (!newPermission?.granted) {
        return null;
      }
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
      });
      return location;
    } catch (error) {
      console.error('[LOCATION] Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your device settings.',
        [{ text: 'OK' }]
      );
      return null;
    }
  }

  // Get nearby parking spots (mock implementation)
  async getNearbyParkingSpots(): Promise<any[]> {
    if (!this.isEnabled) {
      Alert.alert(
        'Location Services Disabled',
        'Please enable location services to find nearby parking spots.',
        [{ text: 'OK' }]
      );
      return [];
    }

    const location = await this.getCurrentLocation();
    if (!location) {
      return [];
    }

    // Mock nearby parking spots based on location
    return [
      {
        id: '1',
        title: 'City Center Garage',
        distance: '0.3 km',
        price: '$2.5/hr',
        spots: 12,
        rating: 4.8,
        features: ['Covered', 'Security'],
        isFavorite: false,
        isAvailable: true,
        coordinates: {
          latitude: location.coords.latitude + 0.001,
          longitude: location.coords.longitude + 0.001,
        }
      },
      {
        id: '2',
        title: 'Riverside Lot A',
        distance: '0.8 km',
        price: '$1.8/hr',
        spots: 7,
        rating: 4.5,
        features: ['24/7', 'EV'],
        isFavorite: true,
        isAvailable: true,
        coordinates: {
          latitude: location.coords.latitude - 0.002,
          longitude: location.coords.longitude + 0.001,
        }
      }
    ];
  }

  // Check if location is required for a feature
  async checkLocationAccess(featureName: string): Promise<boolean> {
    if (!this.isEnabled) {
      Alert.alert(
        'Location Services Disabled',
        `Location services are required for ${featureName}. Please enable them in your profile settings.`,
        [{ text: 'OK' }]
      );
      return false;
    }

    const permission = await this.getPermissionStatus();
    if (!permission?.granted) {
      Alert.alert(
        'Location Permission Required',
        `${featureName} requires location access. Would you like to enable it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: () => this.requestPermission() }
        ]
      );
      return false;
    }

    return true;
  }
}

export const locationService = LocationService.getInstance();
