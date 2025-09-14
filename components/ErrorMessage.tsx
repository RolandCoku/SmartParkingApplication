import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/SharedStyles";

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.text}>⚠️ {message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.errorBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.errorBorder,
  },
  text: {
    color: colors.errorText,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ErrorMessage;
