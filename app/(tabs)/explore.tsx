import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/constants/SharedStyles';
import BottomBar from '@/components/BottomBar';
import SearchBar from '@/components/SearchBar';
import FilterChips from '@/components/FilterChips';

export default function Explore() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleNavigation = (key: 'home' | 'search' | 'bookings' | 'profile') => {
    if (key === 'search') return; // Already on search/explore

    // Navigate immediately without loading states
    if (key === 'home') router.replace('/home');
    else if (key === 'bookings') router.replace('/bookings');
    else if (key === 'profile') Alert.alert('Profile', 'Profile screen coming soon');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/home')}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore Parking</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchSection}>
        <SearchBar />
        <FilterChips />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.comingSoon}>
          <MaterialIcons name="search" size={64} color={colors.textSecondary} />
          <Text style={styles.comingSoonTitle}>Explore Coming Soon</Text>
          <Text style={styles.comingSoonSubtitle}>
            Advanced search and filtering features are being developed
          </Text>
        </View>
      </ScrollView>

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
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  searchSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  comingSoon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  comingSoonTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
});
