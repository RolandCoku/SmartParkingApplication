import { colors } from '@/constants/SharedStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthButton from './AuthButton';

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

interface ParkingSpotsProps {
  onExplore: () => void;
}

export default function ParkingSpots({ onExplore }: ParkingSpotsProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const items: ParkingSpot[] = useMemo(
    () => [
      {
        id: '1',
        title: 'City Center Garage',
        distance: '0.3 km',
        price: '$2.5/hr',
        spots: 12,
        rating: 4.8,
        features: ['Covered', 'Security'],
        isFavorite: false,
        isAvailable: true
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
        isAvailable: true
      },
      {
        id: '3',
        title: 'Mall Parking West',
        distance: '1.2 km',
        price: '$3.0/hr',
        spots: 23,
        rating: 4.2,
        features: ['Covered', 'Shopping'],
        isFavorite: false,
        isAvailable: false
      },
      {
        id: '4',
        title: 'Underground C-12',
        distance: '1.6 km',
        price: '$2.2/hr',
        spots: 4,
        rating: 4.7,
        features: ['Covered', 'Security', 'EV'],
        isFavorite: false,
        isAvailable: true
      },
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

  const getFeatureStyle = (feature: string) => {
    switch (feature) {
      case 'Covered':
        return { backgroundColor: '#9C27B0', color: '#FFFFFF' }; // Purple
      case 'Security':
        return { backgroundColor: '#FF5722', color: '#FFFFFF' }; // Orange/Red
      case '24/7':
        return { backgroundColor: '#4CAF50', color: '#FFFFFF' }; // Green
      case 'EV':
        return { backgroundColor: '#2196F3', color: '#FFFFFF' }; // Blue (clickable)
      case 'Shopping':
        return { backgroundColor: '#FF9800', color: '#FFFFFF' }; // Orange
      default:
        return { backgroundColor: colors.textSecondary, color: '#FFFFFF' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Spots</Text>
        <TouchableOpacity onPress={onExplore}>
          <Text style={styles.seeAll}>View All</Text>
        </TouchableOpacity>
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

      {filteredItems.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
          {filteredItems.map((item) => (
          <View key={item.id} style={[styles.card, !item.isAvailable && styles.cardUnavailable]}>
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                  <MaterialIcons
                    name={favorites.has(item.id) ? "favorite" : "favorite-border"}
                    size={18}
                    color={favorites.has(item.id) ? "#FF69B4" : colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.cardDistance}>{item.distance}</Text>
                <View style={styles.rating}>
                  <MaterialIcons name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </View>
            </View>
            <View style={styles.features}>
              {item.features.map((feature, index) => {
                const featureStyle = getFeatureStyle(feature);
                const isClickable = feature === 'EV' || feature === 'Shopping';

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.featureTag,
                      { backgroundColor: featureStyle.backgroundColor }
                    ]}
                    onPress={isClickable ? () => Alert.alert('Feature', `${feature} filter applied`) : undefined}
                    disabled={!isClickable}
                  >
                    <Text style={[styles.featureText, { color: featureStyle.color }]}>
                      {feature}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.price}>{item.price}</Text>
              <Text style={[styles.spots, !item.isAvailable && styles.spotsUnavailable]}>
                {item.isAvailable ? `${item.spots} spots` : 'Full'}
              </Text>
            </View>
            <AuthButton
              title={item.isAvailable ? "Book Now" : "Waitlist"}
              onPress={onExplore}
              variant={item.isAvailable ? "primary" : "secondary"}
            />
          </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyState}>
            <MaterialIcons name="local-parking" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Spots Found</Text>
            <Text style={styles.emptySubtitle}>
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

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 24
  },
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
  card: {
    width: 240,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardUnavailable: { opacity: 0.7 },
  cardHeader: { marginBottom: 10 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { color: colors.text, fontWeight: '800', fontSize: 15, flex: 1, paddingRight: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDistance: { color: colors.textSecondary, fontSize: 11 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  featureTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  featureText: { fontSize: 9, fontWeight: '700' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  price: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  spots: { color: colors.textSecondary, fontWeight: '600', fontSize: 12 },
  spotsUnavailable: { color: '#FF4444' },
});
