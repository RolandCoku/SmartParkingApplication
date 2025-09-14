// components/AppHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/SharedStyles';

interface AppHeaderProps {
  title: string;
  subtitle: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.wrap} accessibilityRole="header">
      <View style={styles.brandRow}>
        <View style={styles.badge} accessibilityLabel="SmartParking logo">
          <Text style={styles.badgeText}>🅿️</Text>
        </View>
        <View style={{ gap: 2 }}>
          <Text style={styles.title} maxFontSizeMultiplier={1.2}>{title}</Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={1.1}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  badgeText: { color: '#fff', fontSize: 20 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary },
});

export default AppHeader;
