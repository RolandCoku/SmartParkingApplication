import React, {useState, useRef} from 'react';
import {
    View,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    SafeAreaView,
    TextInput,
    ScrollView,
} from 'react-native';
import {useRouter, useLocalSearchParams} from 'expo-router';
import FloatingLabelInput from '../../components/FloatingLabelInput';
import AuthButton from '../../components/AuthButton';
import ErrorMessage from '../../components/ErrorMessage';
import StepHeader from '../../components/StepHeader';
import BottomSocial from '../../components/BottomSocial';
import {colors} from '@/constants/SharedStyles';
import {register} from "@/utils/auth";

export const options = {
  headerShown: false,
};

export default function SecurityScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const passwordRef = useRef<TextInput>(null);
    const confirmRef = useRef<TextInput>(null);

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({...prev, [key]: value}));
        setError('');
    };

    const handleRegister = async () => {
        setError('');

        if (!formData.password.trim()) {
            setError('Password is required');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (!formData.confirmPassword.trim()) {
            setError('Please confirm your password');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const result = await register({
                firstName: params.firstName as string,
                lastName: params.lastName as string,
                username: params.username as string,
                email: params.email as string,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                phoneNumber: params.phoneNumber as string,
            });

            if (!result || !result.success) {
                setError(result?.error || 'Registration failed. Please try again.');
            } else {
                // registration succeeded — navigate to home (or login flow if required)
                router.replace('/home');
            }
         } catch (err: any) {
             console.error('Registration error:', err);
             if (err.message === 'Network request failed') {
                 setError('Cannot connect to server. Please check your internet connection.');
             } else {
                 setError(err.message || 'Registration failed. Please try again.');
             }
         } finally {
             setLoading(false);
         }
     };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.content, { justifyContent: 'space-between' }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.mainWrapper}>
                        <View>
                            <StepHeader title="Security" subtitle="Secure your account" step={3} total={3} />

                            <View style={styles.form}>
                                <FloatingLabelInput
                                    ref={passwordRef}
                                    label="Password"
                                    value={formData.password}
                                    onChangeText={v => handleChange('password', v)}
                                    secureTextEntry={true}
                                    returnKeyType="next"
                                    onSubmitEditing={() => confirmRef.current?.focus()}
                                    blurOnSubmit={false}
                                />

                                <FloatingLabelInput
                                    ref={confirmRef}
                                    label="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChangeText={v => handleChange('confirmPassword', v)}
                                    secureTextEntry={true}
                                    returnKeyType="done"
                                    onSubmitEditing={handleRegister}
                                    blurOnSubmit={true}
                                />

                                {error ? <ErrorMessage message={error} /> : null}

                                <View style={styles.buttonContainer}>
                                    <AuthButton
                                        title="Create Account"
                                        onPress={handleRegister}
                                        loading={loading}
                                        variant="primary"
                                    />
                                </View>
                            </View>
                        </View>

                        <BottomSocial onActionPress={() => router.replace('/login')} dividerText={'Or Sign Up With'} />
                     </View>
                 </ScrollView>
             </KeyboardAvoidingView>
         </SafeAreaView>
     );
 }

 const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    keyboardView: { flex: 1 },
    scrollView: { flex: 1 },
    content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 20 },
    mainWrapper: { flex: 1, justifyContent: 'space-between' },
    form: { marginBottom: 20 },
    buttonContainer: { marginTop: 12, marginBottom: 12 },
});
