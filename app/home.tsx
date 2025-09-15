import { debugError } from '@/config/debug';
import { colors } from '@/constants/SharedStyles';
import { getAccessToken, logout } from '@/utils/auth';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
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

interface RecentBooking {
  id: string;
  location: string;
  date: string;
  duration: string;
  amount: string;
  status: 'completed' | 'active' | 'cancelled';
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
  const [user] = useState({ name: 'John Doe', points: 245 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAvailableSpotsModal, setShowAvailableSpotsModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          router.replace('/login');
        }
      } catch (error) {
        debugError('Auth check failed:', error);
        router.replace('/login');
      }
    })();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchQuery(query);
    
    // Simulate API call
    setTimeout(() => {
      const mockResults = [
        { id: 'search-1', title: 'Downtown Garage', distance: '0.2 km', price: '$3.0/hr', spots: 8, rating: 4.6, features: ['Covered', 'EV Charging'], isFavorite: false, isAvailable: true },
        { id: 'search-2', title: 'City Center Plaza', distance: '0.5 km', price: '$2.5/hr', spots: 15, rating: 4.4, features: ['Covered', 'Security'], isFavorite: false, isAvailable: true },
        { id: 'search-3', title: 'Main Street Lot', distance: '0.8 km', price: '$1.8/hr', spots: 12, rating: 4.2, features: ['24/7'], isFavorite: false, isAvailable: true },
      ];
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1000);
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
          <Header onLogout={handleLogout} user={user} router={router} />

          <View style={styles.searchSection}>
            <SearchBar onSearch={handleSearch} />
            <FilterChips />
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
                onSpotPress={(spot) => router.push('/parking-details')}
                onBookNow={() => router.push('/booking')}
              />
            ) : (
              <>
                <MapSection />
                <ParkingSpots 
                  onExplore={() => setShowAvailableSpotsModal(true)} 
                  onSpotPress={(spot) => router.push('/parking-details')}
                  onBookNow={() => router.push('/booking')}
                />
                <RecentBookings 
                  onSeeAll={() => setShowBookingsModal(true)}
                  onBookingPress={(booking) => router.push(`/booking-details?bookingId=${booking.id}`)}
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
          
          <ScrollView 
            style={modalStyles.content}
            contentContainerStyle={[modalStyles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
          >
            <AvailableSpotsModalContent />
          </ScrollView>
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
            <BookingsModalContent onBookingPress={(booking) => {
              setShowBookingsModal(false);
              router.push(`/booking-details?bookingId=${booking.id}`);
            }} />
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
function Header({ onLogout, user, router }: { onLogout: () => void; user: { name: string; points: number }; router: any }) {
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
        <View style={headerStyles.pointsBadge}>
          <MaterialIcons name="stars" size={16} color="#FFD700" />
          <Text style={headerStyles.pointsText}>{user.points}</Text>
        </View>
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
  pointsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  pointsText: { color: colors.text, fontWeight: '700', fontSize: 12 },
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
function FilterChips() {
  const [selected, setSelected] = useState<string>('Nearby');
  const chips = useMemo(() => ['Nearby', 'Cheapest', 'Covered', 'EV', '24/7'], []);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={chipStyles.container}>
      {chips.map((chip) => {
        const active = selected === chip;
        return (
          <TouchableOpacity key={chip} onPress={() => setSelected(chip)} style={[chipStyles.chip, active && chipStyles.chipActive]}>
            <Text style={[chipStyles.chipText, active && chipStyles.chipTextActive]}>{chip}</Text>
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
function ParkingSpots({ onExplore, onSpotPress, onBookNow }: { onExplore: () => void; onSpotPress: (spot: ParkingSpot) => void; onBookNow: () => void }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const items: ParkingSpot[] = useMemo(
    () => [
      { id: '1', title: 'City Center Garage', distance: '0.3 km', price: '$2.5/hr', spots: 12, rating: 4.8, features: ['Covered', 'Security'], isFavorite: false, isAvailable: true },
      { id: '2', title: 'Riverside Lot A', distance: '0.8 km', price: '$1.8/hr', spots: 7, rating: 4.5, features: ['24/7', 'EV'], isFavorite: true, isAvailable: true },
      { id: '3', title: 'Mall Parking West', distance: '1.2 km', price: '$3.0/hr', spots: 23, rating: 4.2, features: ['Covered', 'Shopping'], isFavorite: false, isAvailable: false },
      { id: '4', title: 'Underground C-12', distance: '1.6 km', price: '$2.2/hr', spots: 4, rating: 4.7, features: ['Covered', 'Security', 'EV'], isFavorite: false, isAvailable: true },
    ],
    []
  );

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

  const filters = ['All', 'Favorites', 'EV Charging', 'Covered', '24/7'];

  const filteredItems = items.filter(item => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Favorites') return favorites.has(item.id);
    if (selectedFilter === 'EV Charging') return item.features.includes('EV');
    if (selectedFilter === 'Covered') return item.features.includes('Covered');
    if (selectedFilter === '24/7') return item.features.includes('24/7');
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

      {filteredItems.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={spotsStyles.content}>
          {filteredItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[spotsStyles.card, !item.isAvailable && spotsStyles.cardUnavailable]}
            onPress={() => onSpotPress(item)}
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
              onPress={onBookNow}
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
  onBookNow: () => void; 
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
              onPress={onBookNow}
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
function RecentBookings({ onSeeAll, onBookingPress }: { onSeeAll: () => void; onBookingPress?: (booking: RecentBooking) => void }) {
  const bookings: RecentBooking[] = [
    { id: '1', location: 'City Center Garage', date: 'Today', duration: '2h 30m', amount: '$7.50', status: 'active' },
    { id: '2', location: 'Mall Parking West', date: 'Yesterday', duration: '1h 45m', amount: '$5.25', status: 'completed' },
    { id: '3', location: 'Riverside Lot A', date: '2 days ago', duration: '3h 15m', amount: '$5.85', status: 'completed' },
  ];

  const getStatusColor = (status: RecentBooking['status']) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return colors.textSecondary;
      case 'cancelled': return '#FF4444';
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={bookingsStyles.container}>
      <View style={bookingsStyles.header}>
        <Text style={bookingsStyles.title}>Recent Bookings</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={bookingsStyles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      {bookings.map((booking) => (
        <TouchableOpacity 
          key={booking.id} 
          style={bookingsStyles.bookingCard}
          onPress={() => onBookingPress?.(booking)}
          activeOpacity={0.7}
        >
          <View style={bookingsStyles.bookingHeader}>
            <Text style={bookingsStyles.bookingLocation}>{booking.location}</Text>
            <Text style={[bookingsStyles.bookingStatus, { color: getStatusColor(booking.status) }]}>
              {booking.status.toUpperCase()}
            </Text>
          </View>
          <View style={bookingsStyles.bookingDetails}>
            <Text style={bookingsStyles.bookingDate}>{booking.date}</Text>
            <Text style={bookingsStyles.bookingDuration}>{booking.duration}</Text>
            <Text style={bookingsStyles.bookingAmount}>{booking.amount}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const bookingsStyles = StyleSheet.create({
  container: { paddingHorizontal: 24, marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  seeAll: { color: colors.primary, fontSize: 14, fontWeight: '600' },
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
function AvailableSpotsModalContent() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const items: ParkingSpot[] = useMemo(
    () => [
      { id: '1', title: 'City Center Garage', distance: '0.3 km', price: '$2.5/hr', spots: 12, rating: 4.8, features: ['Covered', 'Security'], isFavorite: false, isAvailable: true },
      { id: '2', title: 'Riverside Lot A', distance: '0.8 km', price: '$1.8/hr', spots: 7, rating: 4.5, features: ['24/7', 'EV'], isFavorite: true, isAvailable: true },
      { id: '3', title: 'Mall Parking West', distance: '1.2 km', price: '$3.0/hr', spots: 23, rating: 4.2, features: ['Covered', 'Shopping'], isFavorite: false, isAvailable: false },
      { id: '4', title: 'Underground C-12', distance: '1.6 km', price: '$2.2/hr', spots: 4, rating: 4.7, features: ['Covered', 'Security', 'EV'], isFavorite: false, isAvailable: true },
      { id: '5', title: 'Downtown Plaza', distance: '0.5 km', price: '$2.8/hr', spots: 15, rating: 4.6, features: ['Covered', 'Security'], isFavorite: false, isAvailable: true },
      { id: '6', title: 'Main Street Lot', distance: '1.0 km', price: '$1.5/hr', spots: 8, rating: 4.3, features: ['24/7'], isFavorite: false, isAvailable: true },
    ],
    []
  );

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

  return (
    <View style={modalContentStyles.container}>
      <View style={modalContentStyles.statsContainer}>
        <View style={modalContentStyles.statItem}>
          <Text style={modalContentStyles.statValue}>{items.length}</Text>
          <Text style={modalContentStyles.statLabel}>Total Spots</Text>
        </View>
        <View style={modalContentStyles.statDivider} />
        <View style={modalContentStyles.statItem}>
          <Text style={modalContentStyles.statValue}>{items.filter(item => item.isAvailable).length}</Text>
          <Text style={modalContentStyles.statLabel}>Available</Text>
        </View>
        <View style={modalContentStyles.statDivider} />
        <View style={modalContentStyles.statItem}>
          <Text style={modalContentStyles.statValue}>{items.filter(item => item.features.includes('EV')).length}</Text>
          <Text style={modalContentStyles.statLabel}>EV Charging</Text>
        </View>
      </View>

      <View style={modalContentStyles.spotsList}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[modalContentStyles.spotCard, !item.isAvailable && modalContentStyles.spotCardUnavailable]}
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
        ))}
      </View>
    </View>
  );
}

function BookingsModalContent({ onBookingPress }: { onBookingPress?: (booking: RecentBooking) => void }) {
  const bookings: RecentBooking[] = [
    { id: '1', location: 'City Center Garage', date: 'Today', duration: '2h 30m', amount: '$7.50', status: 'active' },
    { id: '2', location: 'Mall Parking West', date: 'Yesterday', duration: '1h 45m', amount: '$5.25', status: 'completed' },
    { id: '3', location: 'Riverside Lot A', date: '2 days ago', duration: '3h 15m', amount: '$5.85', status: 'completed' },
    { id: '4', location: 'Downtown Plaza', date: '3 days ago', duration: '1h 20m', amount: '$3.36', status: 'completed' },
    { id: '5', location: 'Main Street Lot', date: '1 week ago', duration: '4h 10m', amount: '$6.15', status: 'completed' },
  ];

  const getStatusColor = (status: RecentBooking['status']) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return colors.textSecondary;
      case 'cancelled': return '#FF4444';
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={modalContentStyles.container}>
      <View style={modalContentStyles.statsContainer}>
        <View style={modalContentStyles.statItem}>
          <Text style={modalContentStyles.statValue}>{bookings.length}</Text>
          <Text style={modalContentStyles.statLabel}>Total Bookings</Text>
        </View>
        <View style={modalContentStyles.statDivider} />
        <View style={modalContentStyles.statItem}>
          <Text style={modalContentStyles.statValue}>{bookings.filter(b => b.status === 'active').length}</Text>
          <Text style={modalContentStyles.statLabel}>Active</Text>
        </View>
        <View style={modalContentStyles.statDivider} />
        <View style={modalContentStyles.statItem}>
          <Text style={modalContentStyles.statValue}>{bookings.filter(b => b.status === 'completed').length}</Text>
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
              <Text style={modalContentStyles.bookingLocation}>{booking.location}</Text>
              <Text style={[modalContentStyles.bookingStatus, { color: getStatusColor(booking.status) }]}>
                {booking.status.toUpperCase()}
              </Text>
            </View>
            <View style={modalContentStyles.bookingDetails}>
              <Text style={modalContentStyles.bookingDate}>{booking.date}</Text>
              <Text style={modalContentStyles.bookingDuration}>{booking.duration}</Text>
              <Text style={modalContentStyles.bookingAmount}>{booking.amount}</Text>
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