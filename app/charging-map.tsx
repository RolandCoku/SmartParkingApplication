import BottomBar from '@/components/BottomBar';
import { colors } from '@/constants/SharedStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChargingStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  available: boolean;
  chargingSpeed: 'Slow' | 'Fast' | 'Ultra-Fast';
  connectorTypes: string[];
  price: string;
  distance: string;
  rating: number;
  network: string;
  lastUpdated: string;
}

export default function ChargingMapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    speed: 'all',
    network: 'all',
    availability: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigation = (key: 'home' | 'search' | 'available' | 'bookings' | 'profile') => {
    if (key === 'search') return; // Already on charging map

    if (key === 'home') router.replace('/home');
    else if (key === 'available') router.push('/available-spots');
    else if (key === 'bookings') router.push('/bookings');
    else if (key === 'profile') router.push('/profile');
  };

  // Mock charging stations data
  const chargingStations: ChargingStation[] = [
    {
      id: '1',
      name: 'Tesla Supercharger',
      address: '123 Main St, Downtown',
      latitude: 40.7580,
      longitude: -73.9855,
      available: true,
      chargingSpeed: 'Ultra-Fast',
      connectorTypes: ['Tesla', 'CCS'],
      price: '$0.35/kWh',
      distance: '0.3 km',
      rating: 4.8,
      network: 'Tesla',
      lastUpdated: '2 min ago'
    },
    {
      id: '2',
      name: 'Electrify America',
      address: '456 River Ave',
      latitude: 40.7505,
      longitude: -73.9934,
      available: false,
      chargingSpeed: 'Fast',
      connectorTypes: ['CCS', 'CHAdeMO'],
      price: '$0.28/kWh',
      distance: '0.8 km',
      rating: 4.5,
      network: 'Electrify America',
      lastUpdated: '5 min ago'
    },
    {
      id: '3',
      name: 'ChargePoint Station',
      address: '789 Business District',
      latitude: 40.7589,
      longitude: -73.9851,
      available: true,
      chargingSpeed: 'Fast',
      connectorTypes: ['CCS', 'Type 2'],
      price: '$0.32/kWh',
      distance: '1.2 km',
      rating: 4.6,
      network: 'ChargePoint',
      lastUpdated: '1 min ago'
    },
    {
      id: '4',
      name: 'EVgo Fast Charger',
      address: '321 Innovation Dr',
      latitude: 40.7527,
      longitude: -73.9772,
      available: true,
      chargingSpeed: 'Ultra-Fast',
      connectorTypes: ['CCS', 'CHAdeMO'],
      price: '$0.30/kWh',
      distance: '1.6 km',
      rating: 4.7,
      network: 'EVgo',
      lastUpdated: '3 min ago'
    },
    {
      id: '5',
      name: 'Volta Charging',
      address: '654 Shopping Plaza',
      latitude: 40.7614,
      longitude: -73.9776,
      available: true,
      chargingSpeed: 'Slow',
      connectorTypes: ['Type 2'],
      price: 'Free',
      distance: '2.1 km',
      rating: 4.3,
      network: 'Volta',
      lastUpdated: '4 min ago'
    },
    {
      id: '6',
      name: 'Blink Charging',
      address: '987 Airport Blvd',
      latitude: 40.7550,
      longitude: -73.9800,
      available: false,
      chargingSpeed: 'Fast',
      connectorTypes: ['CCS', 'Type 2'],
      price: '$0.29/kWh',
      distance: '2.5 km',
      rating: 4.4,
      network: 'Blink',
      lastUpdated: '6 min ago'
    }
  ];

  const mapRegion = {
    latitude: 40.7580,
    longitude: -73.9855,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const filteredStations = chargingStations.filter(station => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        station.name.toLowerCase().includes(query) ||
        station.address.toLowerCase().includes(query) ||
        station.network.toLowerCase().includes(query) ||
        station.connectorTypes.some(connector => connector.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }
    
    if (selectedFilters.speed !== 'all' && station.chargingSpeed !== selectedFilters.speed) return false;
    if (selectedFilters.network !== 'all' && station.network !== selectedFilters.network) return false;
    if (selectedFilters.availability === 'available' && !station.available) return false;
    if (selectedFilters.availability === 'unavailable' && station.available) return false;
    return true;
  });

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'Ultra-Fast': return '#FF4444';
      case 'Fast': return '#FFA500';
      case 'Slow': return '#4CAF50';
      default: return colors.textSecondary;
    }
  };

  const getConnectorIcon = (connector: string) => {
    switch (connector) {
      case 'Tesla': return '⚡';
      case 'CCS': return '🔌';
      case 'CHAdeMO': return '🔋';
      case 'Type 2': return '🔌';
      default: return '⚡';
    }
  };

  const renderStationCard = (station: ChargingStation) => (
    <TouchableOpacity
      key={station.id}
      style={[styles.stationCard, !station.available && styles.stationCardUnavailable]}
      onPress={() => setSelectedStation(station)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.stationName} numberOfLines={1}>{station.name}</Text>
          <View style={[styles.statusDot, { backgroundColor: station.available ? '#4CAF50' : '#FF4444' }]} />
        </View>
        <Text style={styles.stationAddress} numberOfLines={1}>{station.address}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.stationDistance}>{station.distance}</Text>
          <View style={styles.rating}>
            <MaterialIcons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{station.rating}</Text>
          </View>
        </View>
      </View>

      <View style={styles.stationDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Speed:</Text>
          <Text style={[styles.detailValue, { color: getSpeedColor(station.chargingSpeed) }]}>
            {station.chargingSpeed}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Network:</Text>
          <Text style={styles.detailValue}>{station.network}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>{station.price}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Connectors:</Text>
          <View style={styles.connectorContainer}>
            {station.connectorTypes.map((connector, index) => (
              <Text key={index} style={styles.connectorIcon}>
                {getConnectorIcon(connector)}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.lastUpdated}>Updated {station.lastUpdated}</Text>
        <TouchableOpacity
          style={[styles.navigateButton, !station.available && styles.navigateButtonDisabled]}
          onPress={() => Alert.alert('Navigation', `Navigate to ${station.name}`)}
          disabled={!station.available}
        >
          <MaterialIcons 
            name={station.available ? "navigation" : "block"} 
            size={16} 
            color={station.available ? '#FFFFFF' : '#FFFFFF'} 
            style={{ opacity: station.available ? 1 : 0.7 }}
          />
          <Text style={[styles.navigateButtonText, !station.available && styles.navigateButtonTextDisabled]}>
            {station.available ? 'Navigate' : 'Unavailable'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={[styles.filterModal, { paddingTop: insets.top }]}>
        <View style={styles.filterHeader}>
          <TouchableOpacity
            style={styles.filterCloseButton}
            onPress={() => setShowFilters(false)}
          >
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.filterTitle}>Filter Charging Stations</Text>
          <View style={styles.filterHeaderSpacer} />
        </View>

        <ScrollView style={styles.filterContent}>
          {/* Charging Speed Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Charging Speed</Text>
            {['all', 'Slow', 'Fast', 'Ultra-Fast'].map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[styles.filterOption, selectedFilters.speed === speed && styles.filterOptionActive]}
                onPress={() => setSelectedFilters(prev => ({ ...prev, speed }))}
              >
                <Text style={[styles.filterOptionText, selectedFilters.speed === speed && styles.filterOptionTextActive]}>
                  {speed === 'all' ? 'All Speeds' : speed}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Network Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Network</Text>
            {['all', 'Tesla', 'Electrify America', 'ChargePoint', 'EVgo', 'Volta', 'Blink'].map((network) => (
              <TouchableOpacity
                key={network}
                style={[styles.filterOption, selectedFilters.network === network && styles.filterOptionActive]}
                onPress={() => setSelectedFilters(prev => ({ ...prev, network }))}
              >
                <Text style={[styles.filterOptionText, selectedFilters.network === network && styles.filterOptionTextActive]}>
                  {network === 'all' ? 'All Networks' : network}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Availability Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Availability</Text>
            {['all', 'available', 'unavailable'].map((availability) => (
              <TouchableOpacity
                key={availability}
                style={[styles.filterOption, selectedFilters.availability === availability && styles.filterOptionActive]}
                onPress={() => setSelectedFilters(prev => ({ ...prev, availability }))}
              >
                <Text style={[styles.filterOptionText, selectedFilters.availability === availability && styles.filterOptionTextActive]}>
                  {availability === 'all' ? 'All Stations' : 
                   availability === 'available' ? 'Available Only' : 'Unavailable Only'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Charging Stations</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <MaterialIcons name="filter-list" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search charging stations, networks..."
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <MaterialIcons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* View Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'map' && styles.toggleActive]}
          onPress={() => setViewMode('map')}
        >
          <MaterialIcons
            name="map"
            size={18}
            color={viewMode === 'map' ? '#000000' : colors.textSecondary}
          />
          <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleActive]}
          onPress={() => setViewMode('list')}
        >
          <MaterialIcons
            name="view-list"
            size={18}
            color={viewMode === 'list' ? '#000000' : colors.textSecondary}
          />
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List</Text>
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredStations.length} {filteredStations.length === 1 ? 'station' : 'stations'} found
        </Text>
      </View>

      {/* Content */}
      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
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
            {filteredStations.map((station) => (
              <Marker
                key={station.id}
                coordinate={{
                  latitude: station.latitude,
                  longitude: station.longitude,
                }}
                onPress={() => setSelectedStation(station)}
              >
                <View style={[
                  styles.mapMarker,
                  { backgroundColor: station.available ? '#4CAF50' : '#FF4444' }
                ]}>
                  <MaterialIcons
                    name="ev-station"
                    size={20}
                    color="#FFFFFF"
                  />
                </View>
              </Marker>
            ))}
          </MapView>

          {/* Selected Station Info */}
          {selectedStation && (
            <View style={styles.stationInfo}>
              <View style={styles.stationInfoCard}>
                <View style={styles.stationInfoHeader}>
                  <Text style={styles.stationInfoName}>{selectedStation.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedStation(null)}>
                    <MaterialIcons name="close" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.stationInfoAddress}>{selectedStation.address}</Text>
                <View style={styles.stationInfoDetails}>
                  <Text style={styles.stationInfoText}>
                    {selectedStation.chargingSpeed} • {selectedStation.price}
                  </Text>
                  <Text style={[styles.stationInfoStatus, { color: selectedStation.available ? '#4CAF50' : '#FF4444' }]}>
                    {selectedStation.available ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {filteredStations.length > 0 ? (
            filteredStations.map(renderStationCard)
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="ev-station" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Stations Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your filters or search in a different area
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Filters Modal */}
      {renderFilters()}

      <BottomBar
        activeKey="search"
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
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  searchContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
    borderRadius: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  resultsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  resultsText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stationInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  stationInfoCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  stationInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stationInfoName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    paddingRight: 8,
  },
  stationInfoAddress: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  stationInfoDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stationInfoText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  stationInfoStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  stationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stationCardUnavailable: {
    opacity: 0.7,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stationName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    paddingRight: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stationAddress: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stationDistance: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  stationDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  detailValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  connectorContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  connectorIcon: {
    fontSize: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  navigateButtonDisabled: {
    backgroundColor: colors.border,
  },
  navigateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  navigateButtonTextDisabled: {
    color: '#FFFFFF',
    opacity: 0.7,
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
    lineHeight: 20,
  },
  // Filter Modal Styles
  filterModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  filterCloseButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  filterTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  filterHeaderSpacer: {
    width: 40,
  },
  filterContent: {
    flex: 1,
    padding: 24,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  filterOption: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  filterOptionTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
});
