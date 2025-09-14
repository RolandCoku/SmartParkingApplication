// constants/SharedStyles.ts
import { StyleSheet } from "react-native";

export const colors = {
  background: "#000000",      // Pure black background
  surface: "#111111",         // Very dark grey for slight contrast
  primary: "#1E90FF",         // Professional parking blue (DodgerBlue)
  primaryDark: "#1C7ED6",     // Darker blue for pressed states
  text: "#ffffff",            // White text
  textSecondary: "#888888",   // Medium grey text for subtitles
  border: "#333333",          // Dark grey borders
  inputBg: "#1a1a1a",         // Very dark input backgrounds
  buttonSecondary: "#2a2a2a", // Dark grey for secondary buttons

  // Errors (WCAG-friendly contrast)
  errorBg:     "#1a0000",
  errorBorder: "#ff3333",
  errorText:   "#ff8888",
};

export const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Scroll containers
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },

  formContainer: {
    gap: 12,
    marginTop: 8,
  },

  // Section headings
  sectionTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.subtext,
    marginBottom: 16,
  },

  // Inputs & layout helpers
  rowContainer: {
    flexDirection: "row",
    gap: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  halfWidth: {
    flex: 1,
  },

  // Terms / links
  termsText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: colors.subtext,
    textAlign: "center",
  },
  linkText: {
    color: colors.primary,
    fontWeight: "600",
  },

  // Footer blocks
  footer: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  fixedFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontSize: 13,
    color: colors.subtext,
  },

  // Forgot password
  forgotPasswordButton: {
    alignSelf: "center",
    paddingVertical: 12,        // >=44pt height combined with text
    paddingHorizontal: 8,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 15,
  },
});
