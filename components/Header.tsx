import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/constants/SharedStyles';

interface HeaderProps {
  onLogout: () => void;
  user: { name: string; points: number };
}

export default function Header({ onLogout, user }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.brandRow}>
          <Text style={styles.brandText}>Smart</Text>
          <View style={styles.brandHighlight}>
            <Text style={styles.brandHighlightText}>Parking</Text>
          </View>
        </View>
        <Text style={styles.welcomeText}>Welcome back, {user.name.split(' ')[0]}!</Text>
      </View>
      <View style={styles.rightSection}>
        <View style={styles.pointsBadge}>
          <MaterialIcons name="stars" size={16} color="#FFD700" />
          <Text style={styles.pointsText}>{user.points}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications" size={24} color={colors.text} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  leftSection: { flex: 1 },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  brandText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginRight: 6,
    letterSpacing: -0.5
  },
  brandHighlight: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  brandHighlightText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5
  },
  welcomeText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  pointsText: { color: colors.text, fontWeight: '700', fontSize: 12 },
  notificationButton: { position: 'relative', padding: 8 },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: '#FF4444',
    borderRadius: 4
  },
  logoutButton: {
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
});
