import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/SharedStyles';

interface StepHeaderProps {
  title: string;
  subtitle?: string;
  step?: number; // 1-based
  total?: number;
}

export default function StepHeader({ title, subtitle, step = 1, total = 3 }: StepHeaderProps) {
  const dots = Array.from({ length: total }).map((_, i) => i + 1);

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <Text style={styles.brandText}>Smart</Text>
        <View style={styles.brandHighlight}><Text style={styles.brandHighlightText}>Parking</Text></View>
      </View>

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={styles.stepIndicator}>
        {dots.map((d, idx) => (
          <View key={d} style={styles.stepIndicatorContainer}>
            <View style={[styles.stepDot, idx + 1 <= step && styles.stepDotActive]} />
            {idx + 1 < total && <View style={[styles.stepLine, idx + 1 < step && styles.stepLineActive]} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  brandContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  brandText: { fontSize: 22, fontWeight: '800', color: colors.text, marginRight: 6 },
  brandHighlight: { backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  brandHighlightText: { fontSize: 20, fontWeight: '800', color: '#000' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stepIndicatorContainer: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border },
  stepDotActive: { backgroundColor: colors.primary },
  stepLine: { width: 32, height: 2, backgroundColor: colors.border, marginHorizontal: 6 },
  stepLineActive: { backgroundColor: colors.primary },
});
