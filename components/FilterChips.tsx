import React, { useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/SharedStyles';

export default function FilterChips() {
  const [selected, setSelected] = useState<string>('Nearby');
  const chips = useMemo(() => ['Nearby', 'Cheapest', 'Covered', 'EV', '24/7'], []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips.map((chip) => {
        const active = selected === chip;
        return (
          <TouchableOpacity
            key={chip}
            onPress={() => setSelected(chip)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 10, paddingBottom: 6, paddingHorizontal: 2, gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#000000', fontWeight: '800' },
});
