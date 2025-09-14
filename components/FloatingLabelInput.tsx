// components/FloatingLabelInput.tsx
import React, { useState, forwardRef, useEffect, useRef } from "react";
import { View, TextInput, StyleSheet, Animated, Text, Platform } from "react-native";
import { colors } from "@/constants/SharedStyles";

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  keyboardType?:
    | "default" | "email-address" | "numeric" | "phone-pad" | "ascii-capable"
    | "numbers-and-punctuation" | "url" | "number-pad" | "name-phone-pad"
    | "decimal-pad" | "twitter" | "web-search" | "visible-password";
  icon?: string;
  onSubmitEditing?: () => void;
  returnKeyType?: "default" | "done" | "go" | "next" | "search" | "send";
  blurOnSubmit?: boolean;
}

const FloatingLabelInput = forwardRef<TextInput, FloatingLabelInputProps>(({
  label, value, onChangeText,
  secureTextEntry = false, autoCapitalize = "none", autoCorrect = false, keyboardType = "default",
  onSubmitEditing, returnKeyType = "next", blurOnSubmit = false
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: (isFocused || !!value) ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const labelTop = anim.interpolate({ inputRange: [0, 1], outputRange: [18, -8] });
  const labelFontSize = anim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] });
  const labelColor = isFocused ? colors.primary : colors.textSecondary;

  // Determine current background color for input & label so they match
  const currentBg = (isFocused || !!value) ? colors.surface : colors.inputBg;

  return (
    <View style={styles.container}>
      <Animated.Text
        numberOfLines={1}
        pointerEvents="none"
        style={[
          styles.label,
          { top: labelTop, fontSize: labelFontSize, color: labelColor, backgroundColor: currentBg }
        ]}
        accessibilityElementsHidden
      >
        {label}
      </Animated.Text>

      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused, { backgroundColor: currentBg }]}>
        <TextInput
          ref={ref}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          placeholder={isFocused ? '' : undefined}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          selectionColor={colors.primary}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    position: 'absolute',
    left: 18,
    zIndex: 2,
    paddingHorizontal: 6,
    // on iOS the label should sit slightly higher
    ...Platform.select({ ios: { paddingVertical: 0 }, android: {} }),
  },
  inputContainer: {
    // backgroundColor controlled dynamically to match label background
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    height: 52,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    fontSize: 16,
    color: colors.text,
    padding: 0,
    margin: 0,
    fontWeight: '500',
  },
});

export default FloatingLabelInput;
