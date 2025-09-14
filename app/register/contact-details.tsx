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

export const options = {
  headerShown: false,
};

export default function ContactDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [formData, setFormData] = useState({
        email: '',
        phoneNumber: '',
    });
    const [error, setError] = useState('');

    // refs for keyboard navigation
    const emailRef = useRef<TextInput>(null);
    const phoneRef = useRef<TextInput>(null);

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({...prev, [key]: value}));
        setError('');
    };

    const validateAndContinue = () => {
        setError('');

        if (!formData.email.trim()) {
            setError('Email is required');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }
        if (!formData.phoneNumber.trim()) {
            setError('Phone number is required');
            return;
        }

        // Store data and navigate to next step
        router.push({
            pathname: '/register/security',
            params: {
                ...params, // Pass along previous step data
                email: formData.email,
                phoneNumber: formData.phoneNumber,
            }
        });
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
                            <StepHeader title="Contact Details" subtitle="How can we reach you?" step={2} total={3} />

                            {/* Form */}
                            <View style={styles.form}>
                                <FloatingLabelInput
                                    ref={emailRef}
                                    label="Email Address"
                                    value={formData.email}
                                    onChangeText={v => handleChange('email', v)}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                    returnKeyType="next"
                                    onSubmitEditing={() => phoneRef.current?.focus()}
                                    blurOnSubmit={false}
                                />

                                <FloatingLabelInput
                                    ref={phoneRef}
                                    label="Phone Number"
                                    value={formData.phoneNumber}
                                    onChangeText={v => handleChange('phoneNumber', v)}
                                    keyboardType="phone-pad"
                                    returnKeyType="done"
                                    onSubmitEditing={validateAndContinue}
                                    blurOnSubmit={true}
                                />

                                {error ? <ErrorMessage message={error} /> : null}

                                <View style={styles.buttonContainer}>
                                    <AuthButton
                                        title="Continue"
                                        onPress={validateAndContinue}
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
    inputLabel: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 8 },
});
