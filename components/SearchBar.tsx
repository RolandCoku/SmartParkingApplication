import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/constants/SharedStyles';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <MaterialIcons
          name="location-on"
          size={20}
          color={colors.textSecondary}
          style={styles.locationIcon}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search parking, address..."
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={[styles.voiceButton, isVoiceActive && styles.voiceButtonActive]}
          onPress={() => setIsVoiceActive(!isVoiceActive)}
        >
          <MaterialIcons
            name="mic"
            size={20}
            color={isVoiceActive ? '#000000' : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.searchButton}>
        <MaterialIcons name="search" size={20} color="#000000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8 },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  locationIcon: { marginRight: 8 },
  input: { flex: 1, color: colors.text, paddingVertical: 12 },
  voiceButton: { padding: 4, borderRadius: 8 },
  voiceButtonActive: { backgroundColor: colors.primary },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
