import { colors } from '@/constants/SharedStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ParkingLocation {
  id: number;
  name: string;
  distance: string;
  spots: number;
  price: string;
  latitude: number;
  longitude: number;
  available: boolean;
}

export default function MapSection() {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [fullScreenMap, setFullScreenMap] = useState(false);
  const insets = useSafeAreaInsets();

  // Dummy parking locations around a central area (using coordinates around Times Square, NYC as example)
  const parkingLocations: ParkingLocation[] = [
    {
      id: 1,
      name: 'City Center Garage',
      distance: '0.3 km',
      spots: 12,
      price: '$2.5/hr',
      latitude: 40.7580,
      longitude: -73.9855,
      available: true
    },
    {
      id: 2,
      name: 'Mall Parking West',
      distance: '1.2 km',
      spots: 0,
      price: '$3.0/hr',
      latitude: 40.7614,
      longitude: -73.9776,
      available: false
    },
    {
      id: 3,
      name: 'Riverside Lot A',
      distance: '0.8 km',
      spots: 7,
      price: '$1.8/hr',
      latitude: 40.7505,
      longitude: -73.9934,
      available: true
    },
    {
      id: 4,
      name: 'Underground C-12',
      distance: '1.6 km',
      spots: 4,
      price: '$2.2/hr',
      latitude: 40.7589,
      longitude: -73.9851,
      available: true
    },
    {
      id: 5,
      name: 'Street Parking Zone',
      distance: '0.5 km',
      spots: 0,
      price: '$1.0/hr',
      latitude: 40.7527,
      longitude: -73.9772,
      available: false
    },
  ];

  // Center of the map (Times Square area)
  const mapRegion = {
    latitude: 40.7580,
    longitude: -73.9855,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const availableSpots = parkingLocations.filter(loc => loc.available).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>Nearby Parking</Text>
          <Text style={styles.subtitle}>{availableSpots} available locations</Text>
        </View>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <TouchableOpacity
          style={styles.mapTouchable}
          onPress={() => setFullScreenMap(true)}
          activeOpacity={0.9}
        >
          <MapView
            style={styles.mapView}
            provider={PROVIDER_GOOGLE}
            initialRegion={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={false}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            customMapStyle={[
              {
                featureType: "all",
                stylers: [
                  { saturation: -20 },
                  { lightness: 10 }
                ]
              }
            ]}
          >
            {/* Parking location markers */}
            {parkingLocations.map((location) => (
              <Marker
                key={location.id}
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
              >
                <View style={[
                  styles.customMarker,
                  location.available ? styles.markerAvailable : styles.markerUnavailable,
                ]}>
                  <MaterialIcons
                    name="local-parking"
                    size={16}
                    color={location.available ? '#000000' : '#FFFFFF'}
                  />
                </View>
              </Marker>
            ))}
          </MapView>
        </TouchableOpacity>

        {/* Map controls */}
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={() => setFullScreenMap(true)}
        >
          <MaterialIcons name="fullscreen" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Full Screen Map Modal */}
      <Modal
        visible={fullScreenMap}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <View style={[styles.fullScreenContainer, { paddingTop: insets.top }]}>
          {/* Full Screen Map Header */}
          <View style={styles.fullScreenHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setFullScreenMap(false)}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.fullScreenTitle}>Nearby Parking</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Full Screen Map */}
          <MapView
            style={styles.fullScreenMap}
            provider={PROVIDER_GOOGLE}
            initialRegion={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
            customMapStyle={[
              {
                featureType: "all",
                stylers: [
                  { saturation: -20 },
                  { lightness: 10 }
                ]
              }
            ]}
          >
            {/* Parking location markers */}
            {parkingLocations.map((location) => (
              <Marker
                key={location.id}
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                onPress={() => setSelectedMarker(selectedMarker === location.id ? null : location.id)}
              >
                <View style={[
                  styles.customMarker,
                  location.available ? styles.markerAvailable : styles.markerUnavailable,
                  selectedMarker === location.id && styles.markerSelected
                ]}>
                  <MaterialIcons
                    name="local-parking"
                    size={16}
                    color={location.available ? '#000000' : '#FFFFFF'}
                  />
                </View>
              </Marker>
            ))}
          </MapView>

          {/* Selected marker info in full screen */}
          {selectedMarker && (
            <View style={styles.fullScreenMarkerInfo}>
              {(() => {
                const location = parkingLocations.find(l => l.id === selectedMarker);
                if (!location) return null;
                return (
                  <View style={styles.fullScreenInfoCard}>
                    <View style={styles.infoHeader}>
                      <Text style={styles.infoTitle}>{location.name}</Text>
                      <TouchableOpacity onPress={() => setSelectedMarker(null)}>
                        <MaterialIcons name="close" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.infoDetails}>
                      <Text style={styles.infoText}>{location.distance} • {location.price}</Text>
                      <Text style={[styles.infoSpots, { color: location.available ? colors.primary : '#FF4444' }]}>
                        {location.available ? `${location.spots} spots` : 'Full'}
                      </Text>
                    </View>
                  </View>
                );
              })()}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 24, marginBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },

  mapContainer: { position: 'relative' },
  mapView: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative'
  },
  customMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000'
  },
  markerAvailable: { backgroundColor: colors.primary },
  markerUnavailable: { backgroundColor: '#FF4444' },
  markerSelected: { transform: [{ scale: 1.2 }], zIndex: 10 },

  recenterButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    backgroundColor: colors.background,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },

  markerInfo: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  infoCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  infoTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  infoDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoText: { color: colors.textSecondary, fontSize: 12 },
  infoSpots: { fontSize: 12, fontWeight: '600' },


  // New styles for full screen map functionality
  mapTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },

  fullScreenContainer: {
    flex: 1,
    backgroundColor: colors.background
  },
  fullScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  fullScreenTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700'
  },
  headerSpacer: {
    width: 40
  },
  fullScreenMap: {
    flex: 1
  },
  fullScreenMarkerInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  fullScreenInfoCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});
