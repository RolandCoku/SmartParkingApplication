import { debugError } from '@/config/debug';
import { colors } from '@/constants/SharedStyles';
import { Booking, ParkingLotSearchDTO } from '@/types';
import { bookingsApi, parkingApi, userApi } from '@/utils/api';
import { getAccessToken, isSessionExpiredError, logout } from '@/utils/auth';
import { locationService } from '@/utils/location';
import { fetchRatesForLots, formatRate } from '@/utils/rates';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import BottomBar from '../components/BottomBar';
import MapSection from '../components/MapSection';

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
}

const ICONS = {
  bolt: 'flash-on',
  drive: 'directions-car',
  park: 'local-parking',
  bookings: 'receipt',
  person: 'person',
  home: 'home',
  search: 'search',
  event: 'event',
} as const;

type IconName = keyof typeof MaterialIcons.glyphMap;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [authenticated, setAuthenticated] = useState(true);
  const [user, setUser] = useState<{ name: string; firstName?: string; lastName?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ParkingLotSearchDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAvailableSpotsModal, setShowAvailableSpotsModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [nearbyParkingLots, setNearbyParkingLots] = useState<ParkingLotSearchDTO[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<string>('All');
  const [filterLoading, setFilterLoading] = useState(false);
  
  // Available spots modal pagination state
  const [allParkingLots, setAllParkingLots] = useState<ParkingLotSearchDTO[]>([]);
  const [availableSpotsLoading, setAvailableSpotsLoading] = useState(false);
  const [availableSpotsPage, setAvailableSpotsPage] = useState(0);
  const [hasMoreAvailableSpots, setHasMoreAvailableSpots] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          router.replace('/login');
        } else {
          await loadUserData();
          loadHomeData();
        }
      } catch (error) {
        debugError('Auth check failed:', error);
        router.replace('/login');
      }
    })();
  }, [router]);

  const loadUserData = async () => {
    try {
      const userData = await userApi.getCurrentUser();
      setUser({
        name: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
    } catch (error) {
      debugError('Failed to load user data:', error);
      // Set a fallback name if user data fails to load
      setUser({ name: 'User', firstName: 'User', lastName: '' });
    }
  };

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load nearby parking lots
      try {
        const userLocation = await locationService.getCurrentLocation();
        let lots: ParkingLotSearchDTO[] = [];
        
        if (userLocation) {
          const nearbyResponse = await parkingApi.findNearbyParkingLots(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            50.0, // 5km radius
            0,
            10
          );
          lots = nearbyResponse.content || [];
        } else {
          // Fallback to available parking lots if no location
          const availableResponse = await parkingApi.findAvailableParkingLots(0, 10);
          lots = availableResponse.content || [];
        }
        
        // Fetch rates for the parking lots
        const lotsWithRates = await fetchRatesForLots(lots);
        setNearbyParkingLots(lotsWithRates);
      } catch (parkingError) {
        debugError('Failed to load parking lots:', parkingError);
        
        // Check if it's a session expiry error
        if (isSessionExpiredError(parkingError)) {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please login again.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/login')
              }
            ]
          );
          return;
        }
        
        // Try fallback to available parking lots
        try {
          const availableResponse = await parkingApi.findAvailableParkingLots(0, 10);
          const lots = availableResponse.content || [];
          const lotsWithRates = await fetchRatesForLots(lots);
          setNearbyParkingLots(lotsWithRates);
        } catch (fallbackError) {
          debugError('Fallback also failed:', fallbackError);
          if (isSessionExpiredError(fallbackError)) {
            Alert.alert(
              'Session Expired',
              'Your session has expired. Please login again.',
              [
                {
                  text: 'OK',
                  onPress: () => router.replace('/login')
                }
              ]
            );
            return;
          }
          setNearbyParkingLots([]);
        }
      }

      // Load recent bookings
      try {
        const bookingsResponse = await bookingsApi.getCurrentBookings(0, 5);
        setRecentBookings(bookingsResponse.content || []);
      } catch (bookingError) {
        debugError('Failed to load bookings:', bookingError);
        if (isSessionExpiredError(bookingError)) {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please login again.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/login')
              }
            ]
          );
          return;
        }
        setRecentBookings([]);
      }
      
    } catch (error) {
      debugError('Failed to load home data:', error);
      // Set empty arrays on error
      setNearbyParkingLots([]);
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchQuery('');
      return;
    }
    
    setIsSearching(true);
    setSearchQuery(query);
    
    try {
      const searchResponse = await parkingApi.searchParkingLots(query, 0, 10);
      const lots = searchResponse.content || [];
      const lotsWithRates = await fetchRatesForLots(lots);
      setSearchResults(lotsWithRates);
    } catch (error) {
      debugError('Search failed:', error);
      if (isSessionExpiredError(error)) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login')
            }
          ]
        );
        return;
      }
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = async (filterKey: string, filters: any) => {
    setCurrentFilter(filterKey);
    setFilterLoading(true);
    
    try {
      if (filterKey === 'All') {
        // Reload all nearby parking lots
        await loadHomeData();
      } else {
        // Apply specific filter
        const filteredResponse = await parkingApi.filterParkingLots(filters, 0, 10);
        const lots = filteredResponse.content || [];
        const lotsWithRates = await fetchRatesForLots(lots);
        setNearbyParkingLots(lotsWithRates);
      }
    } catch (error) {
      debugError('Filter failed:', error);
      if (isSessionExpiredError(error)) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login')
            }
          ]
        );
        return;
      }
      // On filter error, fallback to showing all lots
      await loadHomeData();
    } finally {
      setFilterLoading(false);
    }
  };

  const loadAllAvailableSpots = async (page: number = 0, reset: boolean = false) => {
    try {
      setAvailableSpotsLoading(true);
      
      // Load all available parking lots with pagination
      const response = await parkingApi.findAvailableParkingLots(page, 20); // Load 20 per page
      const lots = response.content || [];
      const lotsWithRates = await fetchRatesForLots(lots);
      
      if (reset) {
        setAllParkingLots(lotsWithRates);
        setAvailableSpotsPage(0);
      } else {
        setAllParkingLots(prev => [...prev, ...lotsWithRates]);
      }
      
      // Check if there are more pages
      setHasMoreAvailableSpots(lots.length === 20); // If we got less than 20, we're at the end
      
    } catch (error) {
      debugError('Failed to load available spots:', error);
      if (isSessionExpiredError(error)) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login')
            }
          ]
        );
        return;
      }
      setHasMoreAvailableSpots(false);
    } finally {
      setAvailableSpotsLoading(false);
    }
  };

  const handleAvailableSpotsModalOpen = () => {
    setShowAvailableSpotsModal(true);
    // Load first page when modal opens
    loadAllAvailableSpots(0, true);
  };

  const loadMoreAvailableSpots = () => {
    if (!availableSpotsLoading && hasMoreAvailableSpots) {
      const nextPage = availableSpotsPage + 1;
      setAvailableSpotsPage(nextPage);
      loadAllAvailableSpots(nextPage, false);
    }
  };

  if (!authenticated) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.page, { paddingTop: insets.top }]}>
          <Header onLogout={handleLogout} user={user || { name: 'Loading...', firstName: 'Loading', lastName: '' }} router={router} />

          <View style={styles.searchSection}>
            <SearchBar onSearch={handleSearch} />
            <FilterChips onFilterChange={handleFilterChange} />
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
            showsVerticalScrollIndicator={false}
          >
            {searchQuery ? (
              <SearchResults 
                query={searchQuery}
                results={searchResults}
                isLoading={isSearching}
                onSpotPress={(spot) => router.push(`/parking-details?lotId=${spot.id}`)}
                onBookNow={(spot) => router.push(`/booking?lotId=${spot.id}`)}
              />
            ) : (
              <>
                <MapSection 
                  parkingLots={nearbyParkingLots}
                  loading={loading || filterLoading}
                />
                <ParkingSpots 
                  onExplore={handleAvailableSpotsModalOpen} 
                  onSpotPress={(spot) => router.push(`/parking-details?lotId=${spot.id}`)}
                  onBookNow={(spot) => router.push(`/booking?lotId=${spot.id}`)}
                  parkingLots={nearbyParkingLots}
                  loading={loading || filterLoading}
                />
                <RecentBookings 
                  onSeeAll={() => setShowBookingsModal(true)}
                  onBookingPress={(booking) => router.push(`/booking-details?bookingId=${booking.id}`)}
                  bookings={recentBookings}
                  loading={loading}
                />
              </>
            )}
          </ScrollView>

          <BottomBar
            activeKey="home"
            onPressItem={(key) => {
              if (key === 'home') router.replace('/home');
              else if (key === 'search') router.push('/charging-map');
              else if (key === 'available') router.push('/available-spots');
              else if (key === 'bookings') router.push('/bookings');
              else if (key === 'profile') router.push('/profile');
            }}
            bottomInset={insets.bottom - 14}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Available Spots Modal */}
      <Modal
        visible={showAvailableSpotsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAvailableSpotsModal(false)}
      >
        <View style={modalStyles.container}>
          <View style={[modalStyles.header, { paddingTop: insets.top + 16 }]}>
            <View style={modalStyles.headerSpacer} />
            <Text style={modalStyles.headerTitle}>Available Spots</Text>
            <TouchableOpacity 
              onPress={() => setShowAvailableSpotsModal(false)}
              style={modalStyles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <AvailableSpotsModalContent 
            parkingLots={allParkingLots}
            loading={availableSpotsLoading}
            hasMore={hasMoreAvailableSpots}
            onLoadMore={loadMoreAvailableSpots}
            onSpotPress={(spot) => {
              setShowAvailableSpotsModal(false);
              router.push(`/parking-details?lotId=${spot.id}`);
            }}
          />
        </View>
      </Modal>

      {/* Bookings Modal */}
      <Modal
        visible={showBookingsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBookingsModal(false)}
      >
        <View style={modalStyles.container}>
          <View style={[modalStyles.header, { paddingTop: insets.top + 16 }]}>
            <View style={modalStyles.headerSpacer} />
            <Text style={modalStyles.headerTitle}>Recent Bookings</Text>
            <TouchableOpacity 
              onPress={() => setShowBookingsModal(false)}
              style={modalStyles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={modalStyles.content}
            contentContainerStyle={[modalStyles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
          >
            <BookingsModalContent 
              bookings={recentBookings}
              loading={loading}
              onBookingPress={(booking) => {
                setShowBookingsModal(false);
                router.push(`/booking-details?bookingId=${booking.id}`);
              }} 
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  page: { flex: 1 },
  content: { flex: 1 },
  searchSection: { paddingHorizontal: 24, paddingVertical: 14 },
});

// Enhanced Header with user info and notifications
function Header({ onLogout, user, router }: { onLogout: () => void; user: { name: string; firstName?: string; lastName?: string }; router: any }) {
  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.leftSection}>
        <View style={headerStyles.brandRow}>
          <Text style={headerStyles.brandText}>Smart</Text>
          <View style={headerStyles.brandHighlight}><Text style={headerStyles.brandHighlightText}>Parking</Text></View>
        </View>
        <Text style={headerStyles.welcomeText}>Welcome back, {user.name.split(' ')[0]}!</Text>
      </View>
      <View style={headerStyles.rightSection}>
        <TouchableOpacity 
          style={headerStyles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <MaterialIcons name="notifications" size={24} color={colors.text} />
          <View style={headerStyles.notificationDot} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onLogout} style={headerStyles.logoutButton}>
          <MaterialIcons name="logout" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  leftSection: { flex: 1 },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  brandText: { fontSize: 24, fontWeight: '800', color: colors.text, marginRight: 6, letterSpacing: -0.5 },
  brandHighlight: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  brandHighlightText: { fontSize: 24, fontWeight: '800', color: '#000000', letterSpacing: -0.5 },
  welcomeText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  notificationButton: { position: 'relative', padding: 8 },
  notificationDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, backgroundColor: '#FF4444', borderRadius: 4 },
  logoutButton: { padding: 8, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
});

// Enhanced Search bar with voice search
function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleVoiceSearch = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      // Simulate voice search
      setTimeout(() => {
        setQuery("Downtown parking");
        setIsVoiceActive(false);
      }, 2000);
    }
  };

  return (
    <View style={searchStyles.container}>
      <View style={searchStyles.inputContainer}>
        <MaterialIcons name="location-on" size={20} color={colors.textSecondary} style={searchStyles.locationIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search parking, address..."
          placeholderTextColor={colors.textSecondary}
          style={searchStyles.input}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={[searchStyles.voiceButton, isVoiceActive && searchStyles.voiceButtonActive]}
          onPress={handleVoiceSearch}
        >
          <MaterialIcons name="mic" size={20} color={isVoiceActive ? '#000000' : colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={searchStyles.searchButton} onPress={handleSearch}>
        <MaterialIcons name="search" size={20} color="#000000" />
      </TouchableOpacity>
    </View>
  );
}

const searchStyles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8 },
  inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border },
  locationIcon: { marginRight: 8 },
  input: { flex: 1, color: colors.text, paddingVertical: 12 },
  voiceButton: { padding: 4, borderRadius: 8 },
  voiceButtonActive: { backgroundColor: colors.primary },
  searchButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});

// Filter chips row
function FilterChips({ onFilterChange }: { onFilterChange: (filter: string, filters: any) => void }) {
  const [selected, setSelected] = useState<string>('All');
  const chips = useMemo(() => [
    { key: 'All', label: 'All', filters: {} },
    { key: 'EV', label: 'EV Charging', filters: { hasChargingStations: true } },
    { key: 'Covered', label: 'Covered', filters: { covered: true } },
    { key: 'Security', label: 'Security', filters: { hasCctv: true } },
    { key: 'Disabled', label: 'Disabled Access', filters: { hasDisabledAccess: true } },
  ], []);

  const handleFilterPress = (chip: typeof chips[0]) => {
    setSelected(chip.key);
    onFilterChange(chip.key, chip.filters);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={chipStyles.container}>
      {chips.map((chip) => {
        const active = selected === chip.key;
        return (
          <TouchableOpacity 
            key={chip.key} 
            onPress={() => handleFilterPress(chip)} 
            style={[chipStyles.chip, active && chipStyles.chipActive]}
          >
            <Text style={[chipStyles.chipText, active && chipStyles.chipTextActive]}>{chip.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const chipStyles = StyleSheet.create({
  container: { paddingTop: 10, paddingBottom: 6, paddingHorizontal: 2, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.surface, borderRadius: 999, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#000000', fontWeight: '800' },
});

// Separate Parking Spots section
function ParkingSpots({ 
  onExplore, 
  onSpotPress, 
  onBookNow, 
  parkingLots, 
  loading 
}: { 
  onExplore: () => void; 
  onSpotPress: (spot: ParkingLotSearchDTO) => void; 
  onBookNow: (spot: ParkingLotSearchDTO) => void;
  parkingLots: ParkingLotSearchDTO[];
  loading: boolean;
}) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const items: ParkingSpot[] = useMemo(() => {
    return parkingLots.map(lot => ({
      id: lot.id.toString(),
      title: lot.name,
      distance: lot.distanceKm ? `${lot.distanceKm.toFixed(1)} km` : 'N/A',
      price: formatRate((lot as any).hourlyRate), // Use real rate from API
      spots: lot.availableSpaces,
      rating: lot.averageRating || 4.0,
      features: [
        ...(lot.hasChargingStations ? ['EV Charging'] : []),
        ...(lot.covered ? ['Covered'] : []),
        ...(lot.hasCctv ? ['Security'] : []),
        ...(lot.hasDisabledAccess ? ['Disabled Access'] : []),
      ],
      isFavorite: favorites.has(lot.id.toString()),
      isAvailable: lot.availableSpaces > 0,
    }));
  }, [parkingLots, favorites]);

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

  const filters = ['All', 'Favorites', 'EV Charging', 'Covered', 'Security'];

  const filteredItems = items.filter(item => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Favorites') return favorites.has(item.id);
    if (selectedFilter === 'EV Charging') return item.features.includes('EV Charging');
    if (selectedFilter === 'Covered') return item.features.includes('Covered');
    if (selectedFilter === 'Security') return item.features.includes('Security');
    return true;
  });

  return (
    <View style={spotsStyles.container}>
      <View style={spotsStyles.header}>
        <Text style={spotsStyles.title}>Available Spots</Text>
        <TouchableOpacity onPress={onExplore}>
          <Text style={spotsStyles.seeAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={spotsStyles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={spotsStyles.filterScroll}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[spotsStyles.filterChip, selectedFilter === filter && spotsStyles.filterChipActive]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[spotsStyles.filterChipText, selectedFilter === filter && spotsStyles.filterChipTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={spotsStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={spotsStyles.loadingText}>Loading parking spots...</Text>
        </View>
      ) : filteredItems.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={spotsStyles.content}>
          {filteredItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[spotsStyles.card, !item.isAvailable && spotsStyles.cardUnavailable]}
            onPress={() => onSpotPress(parkingLots.find(lot => lot.id.toString() === item.id)!)}
            activeOpacity={0.8}
          >
            <View style={spotsStyles.cardHeader}>
              <View style={spotsStyles.titleRow}>
                <Text style={spotsStyles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                >
                  <MaterialIcons
                    name={favorites.has(item.id) ? "favorite" : "favorite-border"}
                    size={18}
                    color={favorites.has(item.id) ? "#FF69B4" : colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <View style={spotsStyles.metaRow}>
                <Text style={spotsStyles.cardDistance}>{item.distance}</Text>
                <View style={spotsStyles.rating}>
                  <MaterialIcons name="star" size={12} color="#FFD700" />
                  <Text style={spotsStyles.ratingText}>{item.rating}</Text>
                </View>
              </View>
            </View>
            <View style={spotsStyles.features}>
              {item.features.map((feature, index) => (
                <View key={index} style={spotsStyles.featureTag}>
                  <Text style={spotsStyles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            <View style={spotsStyles.cardBody}>
              <Text style={spotsStyles.price}>{item.price}</Text>
              <Text style={[spotsStyles.spots, !item.isAvailable && spotsStyles.spotsUnavailable]}>
                {item.isAvailable ? `${item.spots} spots` : 'Full'}
              </Text>
            </View>
            <AuthButton
              title={item.isAvailable ? "Book Now" : "Waitlist"}
              onPress={() => onBookNow(parkingLots.find(lot => lot.id.toString() === item.id)!)}
              variant={item.isAvailable ? "primary" : "secondary"}
            />
          </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={spotsStyles.emptyStateContainer}>
          <View style={spotsStyles.emptyState}>
            <MaterialIcons name="local-parking" size={48} color={colors.textSecondary} />
            <Text style={spotsStyles.emptyTitle}>No Spots Found</Text>
            <Text style={spotsStyles.emptySubtitle}>
              {selectedFilter === 'Favorites' 
                ? 'You haven\'t added any favorites yet'
                : `No ${selectedFilter.toLowerCase()} spots available`}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

// Search Results component
function SearchResults({ 
  query, 
  results, 
  isLoading, 
  onSpotPress, 
  onBookNow 
}: { 
  query: string; 
  results: any[]; 
  isLoading: boolean; 
  onSpotPress: (spot: any) => void; 
  onBookNow: (spot: any) => void; 
}) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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

  if (isLoading) {
    return (
      <View style={searchResultsStyles.container}>
        <View style={searchResultsStyles.header}>
          <Text style={searchResultsStyles.title}>Searching for "{query}"</Text>
        </View>
        <View style={searchResultsStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={searchResultsStyles.loadingText}>Finding parking spots...</Text>
        </View>
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={searchResultsStyles.container}>
        <View style={searchResultsStyles.header}>
          <Text style={searchResultsStyles.title}>Search Results for "{query}"</Text>
        </View>
        <View style={searchResultsStyles.emptyContainer}>
          <MaterialIcons name="search-off" size={64} color={colors.textSecondary} />
          <Text style={searchResultsStyles.emptyTitle}>No Results Found</Text>
          <Text style={searchResultsStyles.emptySubtitle}>
            Try searching with different keywords or check your spelling
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={searchResultsStyles.container}>
      <View style={searchResultsStyles.header}>
        <Text style={searchResultsStyles.title}>Search Results for "{query}"</Text>
        <Text style={searchResultsStyles.count}>{results.length} spots found</Text>
      </View>

      <View style={searchResultsStyles.resultsContainer}>
        {results.map((spot) => (
          <TouchableOpacity
            key={spot.id}
            style={[searchResultsStyles.resultCard, !spot.isAvailable && searchResultsStyles.resultCardUnavailable]}
            onPress={() => onSpotPress(spot)}
            activeOpacity={0.8}
          >
            <View style={searchResultsStyles.cardHeader}>
              <View style={searchResultsStyles.titleRow}>
                <Text style={searchResultsStyles.cardTitle} numberOfLines={1}>{spot.title}</Text>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(spot.id);
                  }}
                >
                  <MaterialIcons
                    name={favorites.has(spot.id) ? "favorite" : "favorite-border"}
                    size={18}
                    color={favorites.has(spot.id) ? "#FF69B4" : colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <View style={searchResultsStyles.metaRow}>
                <Text style={searchResultsStyles.cardDistance}>{spot.distance}</Text>
                <View style={searchResultsStyles.rating}>
                  <MaterialIcons name="star" size={12} color="#FFD700" />
                  <Text style={searchResultsStyles.ratingText}>{spot.rating}</Text>
                </View>
              </View>
            </View>
            <View style={searchResultsStyles.features}>
              {spot.features.map((feature: string, index: number) => (
                <View key={index} style={searchResultsStyles.featureTag}>
                  <Text style={searchResultsStyles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            <View style={searchResultsStyles.cardBody}>
              <Text style={searchResultsStyles.price}>{spot.price}</Text>
              <Text style={[searchResultsStyles.spots, !spot.isAvailable && searchResultsStyles.spotsUnavailable]}>
                {spot.isAvailable ? `${spot.spots} spots` : 'Full'}
              </Text>
            </View>
            <AuthButton
              title={spot.isAvailable ? "Book Now" : "Waitlist"}
              onPress={() => onBookNow(spot)}
              variant={spot.isAvailable ? "primary" : "secondary"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const searchResultsStyles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16, 
    paddingHorizontal: 24 
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  count: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  loadingContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 60 
  },
  loadingText: { 
    color: colors.textSecondary, 
    fontSize: 16, 
    marginTop: 16 
  },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 60 
  },
  emptyTitle: { 
    color: colors.text, 
    fontSize: 20, 
    fontWeight: '700', 
    marginTop: 16, 
    marginBottom: 8 
  },
  emptySubtitle: { 
    color: colors.textSecondary, 
    fontSize: 14, 
    textAlign: 'center', 
    lineHeight: 20 
  },
  resultsContainer: { paddingHorizontal: 24 },
  resultCard: { 
    backgroundColor: colors.surface, 
    borderRadius: 16, 
    padding: 14, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  resultCardUnavailable: { opacity: 0.7 },
  cardHeader: { marginBottom: 10 },
  titleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 4 
  },
  cardTitle: { 
    color: colors.text, 
    fontWeight: '800', 
    fontSize: 15, 
    flex: 1, 
    paddingRight: 8 
  },
  metaRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  cardDistance: { color: colors.textSecondary, fontSize: 11 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  features: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 4, 
    marginBottom: 10 
  },
  featureTag: { 
    backgroundColor: colors.primary, 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 6 
  },
  featureText: { color: '#000000', fontSize: 9, fontWeight: '700' },
  cardBody: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  price: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  spots: { color: colors.textSecondary, fontWeight: '600', fontSize: 12 },
  spotsUnavailable: { color: '#FF4444' },
});

const spotsStyles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 24 },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  seeAll: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  filterContainer: {
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderRadius: 16,
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
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  content: { paddingHorizontal: 16 },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  card: { width: 240, backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginHorizontal: 8, borderWidth: 1, borderColor: colors.border },
  cardUnavailable: { opacity: 0.7 },
  cardHeader: { marginBottom: 10 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { color: colors.text, fontWeight: '800', fontSize: 15, flex: 1, paddingRight: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDistance: { color: colors.textSecondary, fontSize: 11 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  featureTag: { backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  featureText: { color: '#000000', fontSize: 9, fontWeight: '700' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  price: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  spots: { color: colors.textSecondary, fontWeight: '600', fontSize: 12 },
  spotsUnavailable: { color: '#FF4444' },
});

// Recent Bookings section
function RecentBookings({ 
  onSeeAll, 
  onBookingPress, 
  bookings, 
  loading 
}: { 
  onSeeAll: () => void; 
  onBookingPress?: (booking: Booking) => void;
  bookings: Booking[];
  loading: boolean;
}) {

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'ACTIVE': return '#4CAF50';
      case 'COMPLETED': return colors.textSecondary;
      case 'CANCELLED': return '#FF4444';
      case 'CONFIRMED': return '#2196F3';
      case 'PENDING': return '#FF9800';
      default: return colors.textSecondary;
    }
  };

  const formatBookingDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <View style={bookingsStyles.container}>
      <View style={bookingsStyles.header}>
        <Text style={bookingsStyles.title}>Recent Bookings</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={bookingsStyles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={bookingsStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={bookingsStyles.loadingText}>Loading bookings...</Text>
        </View>
      ) : bookings.length > 0 ? (
        bookings.map((booking) => (
        <TouchableOpacity 
          key={booking.id} 
          style={bookingsStyles.bookingCard}
          onPress={() => onBookingPress?.(booking)}
          activeOpacity={0.7}
        >
          <View style={bookingsStyles.bookingHeader}>
              <Text style={bookingsStyles.bookingLocation}>{booking.parkingLotName}</Text>
            <Text style={[bookingsStyles.bookingStatus, { color: getStatusColor(booking.status) }]}>
                {booking.status}
            </Text>
          </View>
          <View style={bookingsStyles.bookingDetails}>
              <Text style={bookingsStyles.bookingDate}>{formatBookingDate(booking.startTime)}</Text>
              <Text style={bookingsStyles.bookingDuration}>{calculateDuration(booking.startTime, booking.endTime)}</Text>
              <Text style={bookingsStyles.bookingAmount}>${booking.totalPrice}</Text>
          </View>
        </TouchableOpacity>
        ))
      ) : (
        <View style={bookingsStyles.emptyContainer}>
          <MaterialIcons name="receipt" size={48} color={colors.textSecondary} />
          <Text style={bookingsStyles.emptyTitle}>No Recent Bookings</Text>
          <Text style={bookingsStyles.emptySubtitle}>Your recent bookings will appear here</Text>
        </View>
      )}
    </View>
  );
}

const bookingsStyles = StyleSheet.create({
  container: { paddingHorizontal: 24, marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  seeAll: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  loadingContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 40 
  },
  loadingText: { 
    color: colors.textSecondary, 
    fontSize: 16, 
    marginTop: 16 
  },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 40 
  },
  emptyTitle: { 
    color: colors.text, 
    fontSize: 18, 
    fontWeight: '700', 
    marginTop: 16, 
    marginBottom: 8 
  },
  emptySubtitle: { 
    color: colors.textSecondary, 
    fontSize: 14, 
    textAlign: 'center' 
  },
  bookingCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookingLocation: { color: colors.text, fontSize: 16, fontWeight: '700' },
  bookingStatus: { fontSize: 12, fontWeight: '800' },
  bookingDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingDate: { color: colors.textSecondary, fontSize: 12 },
  bookingDuration: { color: colors.textSecondary, fontSize: 12 },
  bookingAmount: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});

// Modal Content Components
function AvailableSpotsModalContent({ 
  parkingLots, 
  loading, 
  hasMore, 
  onLoadMore, 
  onSpotPress 
}: { 
  parkingLots: ParkingLotSearchDTO[]; 
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSpotPress: (spot: ParkingLotSearchDTO) => void;
}) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const items: ParkingSpot[] = useMemo(() => {
    return parkingLots.map(lot => ({
      id: lot.id.toString(),
      title: lot.name,
      distance: lot.distanceKm ? `${lot.distanceKm.toFixed(1)} km` : 'N/A',
      price: formatRate((lot as any).hourlyRate), // Use real rate from API
      spots: lot.availableSpaces,
      rating: lot.averageRating || 4.0,
      features: [
        ...(lot.hasChargingStations ? ['EV Charging'] : []),
        ...(lot.covered ? ['Covered'] : []),
        ...(lot.hasCctv ? ['Security'] : []),
        ...(lot.hasDisabledAccess ? ['Disabled Access'] : []),
      ],
      isFavorite: favorites.has(lot.id.toString()),
      isAvailable: lot.availableSpaces > 0,
    }));
  }, [parkingLots, favorites]);

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

  const renderSpotItem = ({ item }: { item: ParkingSpot }) => {
    const parkingLot = parkingLots.find(lot => lot.id.toString() === item.id);
    if (!parkingLot) return null;

    return (
      <TouchableOpacity
        style={[modalContentStyles.spotCard, !item.isAvailable && modalContentStyles.spotCardUnavailable]}
        onPress={() => onSpotPress(parkingLot)}
        activeOpacity={0.8}
      >
        <View style={modalContentStyles.spotHeader}>
          <View style={modalContentStyles.spotTitleRow}>
            <Text style={modalContentStyles.spotTitle} numberOfLines={1}>{item.title}</Text>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(item.id);
              }}
            >
              <MaterialIcons
                name={favorites.has(item.id) ? "favorite" : "favorite-border"}
                size={18}
                color={favorites.has(item.id) ? "#FF69B4" : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <View style={modalContentStyles.spotMetaRow}>
            <Text style={modalContentStyles.spotDistance}>{item.distance}</Text>
            <View style={modalContentStyles.spotRating}>
              <MaterialIcons name="star" size={12} color="#FFD700" />
              <Text style={modalContentStyles.spotRatingText}>{item.rating}</Text>
            </View>
          </View>
        </View>
        <View style={modalContentStyles.spotFeatures}>
          {item.features.map((feature, index) => (
            <View key={index} style={modalContentStyles.spotFeatureTag}>
              <Text style={modalContentStyles.spotFeatureText}>{feature}</Text>
            </View>
          ))}
        </View>
        <View style={modalContentStyles.spotBody}>
          <Text style={modalContentStyles.spotPrice}>{item.price}</Text>
          <Text style={[modalContentStyles.spotSpots, !item.isAvailable && modalContentStyles.spotSpotsUnavailable]}>
            {item.isAvailable ? `${item.spots} spots` : 'Full'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={modalContentStyles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={modalContentStyles.loadingFooterText}>Loading more spots...</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={modalContentStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={modalContentStyles.loadingText}>Loading available spots...</Text>
        </View>
      );
    }

    return (
      <View style={modalContentStyles.emptyContainer}>
        <MaterialIcons name="local-parking" size={64} color={colors.textSecondary} />
        <Text style={modalContentStyles.emptyTitle}>No Available Spots</Text>
        <Text style={modalContentStyles.emptySubtitle}>
          No parking spots are currently available. Try adjusting your filters or check back later.
        </Text>
      </View>
    );
  };

  const handleEndReached = () => {
    if (hasMore && !loading) {
      onLoadMore();
    }
  };

  return (
    <View style={modalContentStyles.container}>
      <View style={modalContentStyles.statsContainer}>
        <View style={modalContentStyles.statItem}>
          <Text style={modalContentStyles.statValue}>{parkingLots.reduce((sum, lot) => sum + lot.capacity, 0)}</Text>
          <Text style={modalContentStyles.statLabel}>Total Spots</Text>
        </View>
        <View style={modalContentStyles.statDivider} />
        <View style={modalContentStyles.statItem}>
          <Text style={modalContentStyles.statValue}>{parkingLots.reduce((sum, lot) => sum + lot.availableSpaces, 0)}</Text>
          <Text style={modalContentStyles.statLabel}>Available</Text>
        </View>
        <View style={modalContentStyles.statDivider} />
        <View style={modalContentStyles.statItem}>
          <Text style={modalContentStyles.statValue}>{parkingLots.filter(lot => lot.hasChargingStations).length}</Text>
          <Text style={modalContentStyles.statLabel}>EV Charging</Text>
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={renderSpotItem}
        keyExtractor={(item) => item.id}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={modalContentStyles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function BookingsModalContent({ bookings, loading, onBookingPress }: { bookings: Booking[]; loading: boolean; onBookingPress?: (booking: Booking) => void }) {

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'ACTIVE': return '#4CAF50';
      case 'COMPLETED': return colors.textSecondary;
      case 'CANCELLED': return '#FF4444';
      case 'CONFIRMED': return '#2196F3';
      case 'PENDING': return '#FF9800';
      default: return colors.textSecondary;
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <View style={modalContentStyles.container}>
        <View style={modalContentStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={modalContentStyles.loadingText}>Loading bookings...</Text>
        </View>
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <View style={modalContentStyles.container}>
        <View style={modalContentStyles.emptyContainer}>
          <MaterialIcons name="receipt" size={64} color={colors.textSecondary} />
          <Text style={modalContentStyles.emptyTitle}>No Recent Bookings</Text>
          <Text style={modalContentStyles.emptySubtitle}>
            Your recent bookings will appear here when you make a reservation.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={modalContentStyles.container}>
      <View style={modalContentStyles.statsContainer}>
        <View style={modalContentStyles.statItem}>
          <Text style={modalContentStyles.statValue}>{bookings.length}</Text>
          <Text style={modalContentStyles.statLabel}>Total Bookings</Text>
        </View>
        <View style={modalContentStyles.statDivider} />
        <View style={modalContentStyles.statItem}>
          <Text style={modalContentStyles.statValue}>{bookings.filter(b => b.status === 'ACTIVE').length}</Text>
          <Text style={modalContentStyles.statLabel}>Active</Text>
        </View>
        <View style={modalContentStyles.statDivider} />
        <View style={modalContentStyles.statItem}>
          <Text style={modalContentStyles.statValue}>{bookings.filter(b => b.status === 'COMPLETED').length}</Text>
          <Text style={modalContentStyles.statLabel}>Completed</Text>
        </View>
      </View>

      <View style={modalContentStyles.bookingsList}>
        {bookings.map((booking) => (
          <TouchableOpacity 
            key={booking.id} 
            style={modalContentStyles.bookingCard}
            onPress={() => onBookingPress?.(booking)}
            activeOpacity={0.7}
          >
            <View style={modalContentStyles.bookingHeader}>
              <Text style={modalContentStyles.bookingLocation}>{booking.parkingLotName}</Text>
              <Text style={[modalContentStyles.bookingStatus, { color: getStatusColor(booking.status) }]}>
                {booking.status}
              </Text>
            </View>
            <View style={modalContentStyles.bookingDetails}>
              <Text style={modalContentStyles.bookingDate}>{new Date(booking.startTime).toLocaleDateString()}</Text>
              <Text style={modalContentStyles.bookingDuration}>{calculateDuration(booking.startTime, booking.endTime)}</Text>
              <Text style={modalContentStyles.bookingAmount}>${booking.totalPrice}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Modal Styles
const modalStyles = StyleSheet.create({
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
  closeButton: {
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
});

const modalContentStyles = StyleSheet.create({
  container: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
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
  spotsList: {
    gap: 16,
  },
  flatListContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingFooterText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  spotCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  spotCardUnavailable: {
    opacity: 0.7,
  },
  spotHeader: {
    marginBottom: 12,
  },
  spotTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  spotTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    flex: 1,
    paddingRight: 8,
  },
  spotMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotDistance: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  spotRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  spotRatingText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  spotFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  spotFeatureTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  spotFeatureText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '700',
  },
  spotBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotPrice: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  spotSpots: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  spotSpotsUnavailable: {
    color: '#FF4444',
  },
  bookingsList: {
    gap: 12,
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingLocation: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  bookingStatus: {
    fontSize: 12,
    fontWeight: '800',
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingDate: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  bookingDuration: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  bookingAmount: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});