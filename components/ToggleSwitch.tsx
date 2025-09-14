import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/SharedStyles';

interface ToggleSwitchProps {
  leftOption: string;
  rightOption: string;
  selectedOption: 'left' | 'right';
  onToggle: (option: 'left' | 'right') => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  leftOption,
  rightOption,
  selectedOption,
  onToggle,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.option,
          styles.leftOption,
          selectedOption === 'left' && styles.selectedOption,
        ]}
        onPress={() => onToggle('left')}
      >
        <Text
          style={[
            styles.optionText,
            selectedOption === 'left' && styles.selectedText,
          ]}
        >
          {leftOption}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          styles.rightOption,
          selectedOption === 'right' && styles.selectedOption,
        ]}
        onPress={() => onToggle('right')}
      >
        <Text
          style={[
            styles.optionText,
            selectedOption === 'right' && styles.selectedText,
          ]}
        >
          {rightOption}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.buttonSecondary,
    borderRadius: 25,
    padding: 4,
    marginBottom: 32,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 21,
    alignItems: 'center',
  },
  leftOption: {
    marginRight: 2,
  },
  rightOption: {
    marginLeft: 2,
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  selectedText: {
    color: '#000000',
  },
});

export default ToggleSwitch;
