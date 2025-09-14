import { colors } from '@/constants/SharedStyles';
import { login } from "@/utils/auth";
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AuthButton from '../components/AuthButton';
import BottomSocial from '../components/BottomSocial';
import ErrorMessage from '../components/ErrorMessage';
import FloatingLabelInput from '../components/FloatingLabelInput';
import { debugError, debugLog } from '../config/debug';

export default function LoginScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Refs for keyboard navigation
    const usernameRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);

    const handleLogin = async () => {
        debugLog('Login button pressed');
        setLoading(true);
        setError('');

        try {
            if (username && password) {
                const data = await login(username, password, rememberMe);
                debugLog('Login successful, navigating to home...');
                router.replace('/home');
            } else {
                setError('Please enter username and password');
            }
        } catch (err: any) {
            debugError('Login error:', err);
            if (err.message === 'Network request failed') {
                setError('Cannot connect to server. Please check your internet connection.');
            } else if (err.message === 'Invalid username or password') {
                setError('Invalid username or password. Please try again.');
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { justifyContent: 'space-between' }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Use a flex container to space content so social section stays near bottom */}
                <View style={styles.mainWrapper}>
                    <View>
                        {/* Header with Branding */}
                        <View style={styles.header}>
                            <View style={styles.brandContainer}>
                                <Text style={styles.brandText}>Smart</Text>
                                <View style={styles.brandHighlight}>
                                    <Text style={styles.brandHighlightText}>Parking</Text>
                                </View>
                            </View>

                            <Text style={styles.title}>Get Started now</Text>
                            <Text style={styles.subtitle}>
                                Sign up for a new account or log in to your existing
                                one to seamlessly browse, explore, and manage your
                                parking spaces with SmartParking.
                            </Text>
                        </View>

                        {/* Form - using FloatingLabelInput (no separate labels) */}
                        <View style={styles.form}>
                            <FloatingLabelInput
                                ref={usernameRef}
                                label="Username or Email"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="email-address"
                                returnKeyType="next"
                                onSubmitEditing={() => passwordRef.current?.focus()}
                                blurOnSubmit={false}
                            />

                            <FloatingLabelInput
                                ref={passwordRef}
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={true}
                                returnKeyType="done"
                                onSubmitEditing={handleLogin}
                                blurOnSubmit={true}
                            />

                            {/* Remember Me and Forgot Password */}
                            <View style={styles.checkboxRow}>
                                <TouchableOpacity
                                    style={styles.checkboxContainer}
                                    onPress={() => setRememberMe(!rememberMe)}
                                >
                                    <View style={[styles.checkbox, rememberMe && styles.checkboxSelected]}>
                                        {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                    <Text style={styles.checkboxText}>Remember me</Text>
                                </TouchableOpacity>

                                <TouchableOpacity>
                                    <Text style={styles.forgotPasswordText}>Forget Password?</Text>
                                </TouchableOpacity>
                            </View>

                            {error ? <ErrorMessage message={error} /> : null}

                            <AuthButton
                                title="Login"
                                onPress={handleLogin}
                                loading={loading}
                                variant="primary"
                            />
                        </View>
                    </View>

                    <BottomSocial
                        onActionPress={() => router.replace('/register')}
                        footerPrefixText={"Don't have an account? "}
                        footerActionLabel={'Sign up'}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 20,
    },
    mainWrapper: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        marginBottom: 28,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    brandText: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text,
        marginRight: 6,
        letterSpacing: -0.5,
    },
    brandHighlight: {
        backgroundColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    brandHighlightText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#000000',
        letterSpacing: -0.5,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 12,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 22,
        fontWeight: '400',
    },
    form: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    checkboxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 4,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: colors.border,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.inputBg,
    },
    checkboxSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkmark: {
        color: '#000000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    checkboxText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
    forgotPasswordText: {
        color: '#ff4444',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
    socialSection: {
        marginBottom: 12,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        fontSize: 13,
        color: colors.textSecondary,
        paddingHorizontal: 12,
        fontWeight: '500',
    },
    bottomArea: {
        // small spacing from bottom, social section and footer grouped here
        marginBottom: 12,
    },
    socialButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        backgroundColor: colors.buttonSecondary,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 1,
    },
    socialButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialButtonText: {
        color: colors.text,
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.2,
        marginLeft: 6,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 8,
        marginTop: 10,
    },
    footerText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        fontWeight: '500',
    },
    linkText: {
        color: colors.primary,
        fontWeight: '700',
        letterSpacing: 0.1,
    },
});
