import { colors } from "@/constants/SharedStyles";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}) => {
  const isPrimary = variant === "primary";

  const buttonStyle: ViewStyle[] = [
    styles.button,
    isPrimary ? styles.primary : styles.secondary,
    ...((loading || disabled) ? [styles.disabled] : []),
  ];

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: loading || disabled, busy: loading }}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      activeOpacity={0.8}
      style={buttonStyle}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#000000" : colors.primary} size="small" />
      ) : (
        <Text
          style={[styles.text, isPrimary ? styles.textPrimary : styles.textSecondary]}
          maxFontSizeMultiplier={1.3}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 44,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.buttonSecondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowOpacity: 0.1,
  },
  disabled: {
    backgroundColor: "#333333",
    borderColor: "#333333",
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  textPrimary: {
    color: "#000000",
  },
  textSecondary: {
    color: colors.text,
  },
});

export default AuthButton;
