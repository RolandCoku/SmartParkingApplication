import { colors } from '@/constants/SharedStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ICONS = {
  bolt: 'flash-on',
  drive: 'directions-car',
  park: 'local-parking',
  bookings: 'receipt',
  person: 'person',
} as const;

const FILLED_ICONS = {
  bolt: 'flash-on',
  drive: 'directions-car',
  park: 'local-parking',
  bookings: 'receipt',
  person: 'person',
} as const;

type IconName = keyof typeof MaterialIcons.glyphMap;

interface BottomBarProps {
  activeKey: 'home' | 'search' | 'available' | 'bookings' | 'profile';
  onPressItem: (key: 'home' | 'search' | 'available' | 'bookings' | 'profile') => void;
  bottomInset?: number;
}

export default function BottomBar({
  activeKey,
  onPressItem,
  bottomInset = 0,
}: BottomBarProps) {
  const items: { key: 'home' | 'search' | 'available' | 'bookings' | 'profile'; label: string; icon: keyof typeof ICONS }[] = [
    { key: 'search', label: 'Charge', icon: 'bolt' },
    { key: 'available', label: 'Available Spots', icon: 'drive' },
    { key: 'home', label: 'Park', icon: 'park' },
    { key: 'bookings', label: 'Bookings', icon: 'bookings' },
    { key: 'profile', label: 'Account', icon: 'person' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <View style={styles.content}>
        {items.map((item, index) => {
          const active = activeKey === item.key;
          const isPark = item.key === 'home';

          if (isPark) {
            return (
              <TouchableOpacity
                key={`${item.key}-${index}`}
                style={[styles.parkButton, active && styles.parkButtonActive]}
                onPress={() => onPressItem(item.key)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                activeOpacity={0.7}
              >
                <View style={[styles.parkIcon, active ? styles.parkIconActive : styles.parkIconInactive]}>
                  <Text style={[styles.parkText, active ? styles.parkTextActive : styles.parkTextInactive]}>P</Text>
                </View>
                <Text style={[styles.parkLabel, active ? styles.parkLabelActive : styles.parkLabelInactive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={`${item.key}-${index}`}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => onPressItem(item.key)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
                <MaterialIcons
                  name={ICONS[item.icon] as IconName}
                  size={24}
                  color={active ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    paddingBottom: 16,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 0,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flex: 1,
    minHeight: 60,
  },
  tabActive: {
    // No background - just color change
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    // No background - just color change
  },
  parkButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flex: 1,
    minHeight: 60,
  },
  parkButtonActive: {
    // No background - just color change
  },
  parkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  parkIconActive: {
    backgroundColor: colors.primary,
  },
  parkIconInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  parkText: {
    fontSize: 20,
    fontWeight: '900',
  },
  parkTextActive: {
    color: '#000000',
  },
  parkTextInactive: {
    color: colors.textSecondary,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  parkLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  parkLabelActive: {
    color: colors.primary,
  },
  parkLabelInactive: {
    color: colors.textSecondary,
  },
});
