import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors } from '@/constants/SharedStyles';

interface Props {
  onActionPress?: () => void;
  style?: any;
  dividerText?: string;
  footerPrefixText?: string;
  footerActionLabel?: string;
}

export default function BottomSocial({
  onActionPress,
  style,
  dividerText = 'Or Sign In With',
  footerPrefixText = 'Already have an account? ',
  footerActionLabel = 'Sign in',
}: Props) {
  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      <View style={styles.socialSection}>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{dividerText}</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton}>
            <View style={styles.socialButtonContent}>
              <Icon name="apple" size={18} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <View style={styles.socialButtonContent}>
              <Icon name="google" size={18} />
              <Text style={styles.socialButtonText}>Google</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {footerPrefixText}
          <Text style={styles.linkText} onPress={onActionPress}>
            {footerActionLabel}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  socialSection: { marginBottom: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 13, color: colors.textSecondary, paddingHorizontal: 12 },
  socialButtons: { flexDirection: 'row', gap: 12 },
  socialButton: { flex: 1, backgroundColor: colors.buttonSecondary, borderRadius: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  socialButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  socialButtonText: { color: colors.text, fontSize: 15, fontWeight: '600', marginLeft: 6 },
  footer: { alignItems: 'center', paddingBottom: 8, marginTop: 10 },
  footerText: { fontSize: 14, color: colors.textSecondary },
  linkText: { color: colors.primary, fontWeight: '700' },
});
