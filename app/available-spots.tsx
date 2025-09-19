import BottomBar from '@/components/BottomBar';
import { colors } from '@/constants/SharedStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
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

interface ParkingSpot {
  id: string;
  title: string;
  distance: string;
  price: string;
  spots: number;
  rating: number;
  features: string[];
  isFavorite: boolean;
  isAvailable: boolean;
  hasCharging: boolean;
  address: string;
  image: string;
}

export default function AvailableSpotsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    features: 'all',
    availability: 'all',
    price: 'all',
    favorites: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigation = (key: 'home' | 'search' | 'available' | 'bookings' | 'profile') => {
    if (key === 'available') return; // Already on available spots

    if (key === 'home') router.replace('/home');
    else if (key === 'search') router.push('/charging-map');
    else if (key === 'bookings') router.push('/bookings');
    else if (key === 'profile') router.push('/profile');
  };

  // Mock parking spots data with charging information
  const parkingSpots: ParkingSpot[] = [
    {
      id: '1',
      title: 'City Center Garage',
      distance: '0.3 km',
      price: 'Rate N/A',
      spots: 12,
      rating: 4.8,
      features: ['Covered', 'Security', 'EV Charging'],
      isFavorite: false,
      isAvailable: true,
      hasCharging: true,
      address: '123 Main St, Downtown',
      image: 'garage1'
    },
    {
      id: '2',
      title: 'Riverside Lot A',
      distance: '0.8 km',
      price: 'Rate N/A',
      spots: 7,
      rating: 4.5,
      features: ['24/7', 'EV Charging'],
      isFavorite: true,
      isAvailable: true,
      hasCharging: true,
      address: '456 River Ave',
      image: 'lot1'
    },
    {
      id: '3',
      title: 'Mall Parking West',
      distance: '1.2 km',
      price: 'Rate N/A',
      spots: 23,
      rating: 4.2,
      features: ['Covered', 'Shopping'],
      isFavorite: false,
      isAvailable: false,
      hasCharging: false,
      address: '789 Shopping Blvd',
      image: 'mall1'
    },
    {
      id: '4',
      title: 'Underground C-12',
      distance: '1.6 km',
      price: 'Rate N/A',
      spots: 4,
      rating: 4.7,
      features: ['Covered', 'Security', 'EV Charging'],
      isFavorite: false,
      isAvailable: true,
      hasCharging: true,
      address: '321 Business District',
      image: 'underground1'
    },
    {
      id: '5',
      title: 'Street Parking Zone',
      distance: '0.5 km',
      price: 'Rate N/A',
      spots: 0,
      rating: 4.0,
      features: ['Street'],
      isFavorite: false,
      isAvailable: false,
      hasCharging: false,
      address: '654 Central Park',
      image: 'street1'
    },
    {
      id: '6',
      title: 'Tech Campus Garage',
      distance: '2.1 km',
      price: 'Rate N/A',
      spots: 15,
      rating: 4.6,
      features: ['Covered', 'EV Charging', 'Security'],
      isFavorite: false,
      isAvailable: true,
      hasCharging: true,
      address: '987 Innovation Dr',
      image: 'tech1'
    },
    {
      id: '7',
      title: 'Airport Terminal A',
      distance: '5.2 km',
      price: 'Rate N/A',
      spots: 8,
      rating: 4.3,
      features: ['Covered', 'EV Charging', '24/7'],
      isFavorite: false,
      isAvailable: true,
      hasCharging: true,
      address: '555 Airport Blvd',
      image: 'airport1'
    },
    {
      id: '8',
      title: 'Downtown Plaza',
      distance: '0.9 km',
      price: 'Rate N/A',
      spots: 6,
      rating: 4.4,
      features: ['Outdoor', 'Shopping'],
      isFavorite: false,
      isAvailable: true,
      hasCharging: false,
      address: '777 Plaza St',
      image: 'plaza1'
    }
  ];

  const filters = ['All', 'Favorites', 'EV Charging', 'Covered', '24/7', 'Nearby'];

  const filteredSpots = parkingSpots.filter(spot => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        spot.title.toLowerCase().includes(query) ||
        spot.address.toLowerCase().includes(query) ||
        spot.features.some(feature => feature.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }
    
    // Quick filter chips
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Favorites') return favorites.has(spot.id);
    if (selectedFilter === 'EV Charging') return spot.hasCharging;
    if (selectedFilter === 'Covered') return spot.features.includes('Covered');
    if (selectedFilter === '24/7') return spot.features.includes('24/7');
    if (selectedFilter === 'Nearby') return parseFloat(spot.distance) <= 1.0;
    
    // Advanced filters
    if (selectedFilters.type !== 'all') {
      if (selectedFilters.type === 'garage' && !spot.title.toLowerCase().includes('garage')) return false;
      if (selectedFilters.type === 'lot' && !spot.title.toLowerCase().includes('lot')) return false;
      if (selectedFilters.type === 'street' && !spot.features.includes('Street')) return false;
    }
    
    if (selectedFilters.features !== 'all') {
      if (selectedFilters.features === 'ev' && !spot.hasCharging) return false;
      if (selectedFilters.features === 'covered' && !spot.features.includes('Covered')) return false;
      if (selectedFilters.features === 'security' && !spot.features.includes('Security')) return false;
      if (selectedFilters.features === '24/7' && !spot.features.includes('24/7')) return false;
    }
    
    if (selectedFilters.availability === 'available' && !spot.isAvailable) return false;
    if (selectedFilters.availability === 'unavailable' && spot.isAvailable) return false;
    
    if (selectedFilters.price !== 'all') {
      const priceValue = parseFloat(spot.price.replace('$', '').replace('/hr', ''));
      if (selectedFilters.price === 'cheap' && priceValue > 2.0) return false;
      if (selectedFilters.price === 'medium' && (priceValue <= 2.0 || priceValue > 3.0)) return false;
      if (selectedFilters.price === 'expensive' && priceValue <= 3.0) return false;
    }
    
    if (selectedFilters.favorites === 'favorites' && !favorites.has(spot.id)) return false;
    if (selectedFilters.favorites === 'not-favorites' && favorites.has(spot.id)) return false;
    
    return true;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const renderSpotCard = (spot: ParkingSpot) => (
    <TouchableOpacity
      key={spot.id}
      style={[styles.spotCard, !spot.isAvailable && styles.spotCardUnavailable]}
      onPress={() => router.push(`/parking-details?lotId=${spot.id}`)}
      activeOpacity={0.8}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.spotTitle} numberOfLines={1}>{spot.title}</Text>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(spot.id);
            }}
          >
            <MaterialIcons
              name={favorites.has(spot.id) ? "favorite" : "favorite-border"}
              size={20}
              color={favorites.has(spot.id) ? "#FF69B4" : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.spotAddress} numberOfLines={1}>{spot.address}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.spotDistance}>{spot.distance}</Text>
          <View style={styles.rating}>
            <MaterialIcons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{spot.rating}</Text>
          </View>
        </View>
      </View>

      {/* Features */}
      <View style={styles.features}>
        {spot.features.map((feature, index) => (
          <View key={index} style={[
            styles.featureTag,
            feature === 'EV Charging' && styles.evChargingTag
          ]}>
            <Text style={[
              styles.featureText,
              feature === 'EV Charging' && styles.evChargingText
            ]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.priceInfo}>
          <Text style={styles.price}>{spot.price}</Text>
          <Text style={[styles.spots, !spot.isAvailable && styles.spotsUnavailable]}>
            {spot.isAvailable ? `${spot.spots} spots` : 'Full'}
          </Text>
        </View>
        <AuthButton
          title={spot.isAvailable ? "Book Now" : "Waitlist"}
          onPress={() => router.push('/booking')}
          variant={spot.isAvailable ? "primary" : "secondary"}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Available Spots</Text>
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
            placeholder="Search parking spots, locations..."
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

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterChipText, selectedFilter === filter && styles.filterChipTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredSpots.length} {filteredSpots.length === 1 ? 'spot' : 'spots'} found
        </Text>
      </View>

      {/* Parking Spots List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredSpots.length > 0 ? (
          filteredSpots.map(renderSpotCard)
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="local-parking" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Spots Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your filters or search in a different area
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Advanced Filters Modal */}
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
            <Text style={styles.filterTitle}>Filter Parking Spots</Text>
            <View style={styles.filterHeaderSpacer} />
          </View>

          <ScrollView style={styles.filterContent}>
            {/* Parking Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Parking Type</Text>
              {['all', 'garage', 'lot', 'street'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterOption, selectedFilters.type === type && styles.filterOptionActive]}
                  onPress={() => setSelectedFilters(prev => ({ ...prev, type }))}
                >
                  <Text style={[styles.filterOptionText, selectedFilters.type === type && styles.filterOptionTextActive]}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Features Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Features</Text>
              {['all', 'ev', 'covered', 'security', '24/7'].map((feature) => (
                <TouchableOpacity
                  key={feature}
                  style={[styles.filterOption, selectedFilters.features === feature && styles.filterOptionActive]}
                  onPress={() => setSelectedFilters(prev => ({ ...prev, features: feature }))}
                >
                  <Text style={[styles.filterOptionText, selectedFilters.features === feature && styles.filterOptionTextActive]}>
                    {feature === 'all' ? 'All Features' : 
                     feature === 'ev' ? 'EV Charging' :
                     feature === '24/7' ? '24/7 Access' :
                     feature.charAt(0).toUpperCase() + feature.slice(1)}
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
                    {availability === 'all' ? 'All Spots' : 
                     availability === 'available' ? 'Available Only' : 'Unavailable Only'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              {['all', 'cheap', 'medium', 'expensive'].map((price) => (
                <TouchableOpacity
                  key={price}
                  style={[styles.filterOption, selectedFilters.price === price && styles.filterOptionActive]}
                  onPress={() => setSelectedFilters(prev => ({ ...prev, price }))}
                >
                  <Text style={[styles.filterOptionText, selectedFilters.price === price && styles.filterOptionTextActive]}>
                    {price === 'all' ? 'All Prices' : 
                     price === 'cheap' ? 'Under $2/hr' :
                     price === 'medium' ? '$2-3/hr' :
                     'Over $3/hr'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Favorites Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Favorites</Text>
              {['all', 'favorites', 'not-favorites'].map((favorite) => (
                <TouchableOpacity
                  key={favorite}
                  style={[styles.filterOption, selectedFilters.favorites === favorite && styles.filterOptionActive]}
                  onPress={() => setSelectedFilters(prev => ({ ...prev, favorites: favorite }))}
                >
                  <Text style={[styles.filterOptionText, selectedFilters.favorites === favorite && styles.filterOptionTextActive]}>
                    {favorite === 'all' ? 'All Spots' : 
                     favorite === 'favorites' ? 'Favorites Only' : 'Not Favorites'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>

      <BottomBar
        activeKey="available"
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
  filterContainer: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  filterScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  filterChipTextActive: {
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  spotCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  spotCardUnavailable: {
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
  spotTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    paddingRight: 8,
  },
  spotAddress: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotDistance: {
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
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  featureTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  evChargingTag: {
    backgroundColor: '#00C851',
  },
  featureText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '700',
  },
  evChargingText: {
    color: '#FFFFFF',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {
    alignItems: 'flex-start',
  },
  price: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  spots: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  spotsUnavailable: {
    color: '#FF4444',
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
