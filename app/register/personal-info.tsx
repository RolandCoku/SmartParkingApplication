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
import {useRouter} from 'expo-router';
import FloatingLabelInput from '../../components/FloatingLabelInput';
import AuthButton from '../../components/AuthButton';
import ErrorMessage from '../../components/ErrorMessage';
import StepHeader from '../../components/StepHeader';
import BottomSocial from '../../components/BottomSocial';
import {colors} from '@/constants/SharedStyles';

export const options = {
  headerShown: false,
};

export default function PersonalInfoScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
    });
    const [error, setError] = useState('');

    // Refs for keyboard navigation
    const firstNameRef = useRef<TextInput>(null);
    const lastNameRef = useRef<TextInput>(null);
    const usernameRef = useRef<TextInput>(null);

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({...prev, [key]: value}));
        setError('');
    };

    const validateAndContinue = () => {
        setError('');

        if (!formData.firstName.trim()) {
            setError('First name is required');
            return;
        }
        if (!formData.lastName.trim()) {
            setError('Last name is required');
            return;
        }
        if (!formData.username.trim()) {
            setError('Username is required');
            return;
        }
        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        // Store data and navigate to next step
        router.push({
            pathname: '/register/contact-details',
            params: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
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
                            <StepHeader title="Personal Information" subtitle="Tell us about yourself" step={1} total={3} />

                            {/* Form */}
                            <View style={styles.form}>
                                <FloatingLabelInput
                                    ref={firstNameRef}
                                    label="First Name"
                                    value={formData.firstName}
                                    onChangeText={v => handleChange('firstName', v)}
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                    onSubmitEditing={() => lastNameRef.current?.focus()}
                                    blurOnSubmit={false}
                                />

                                <FloatingLabelInput
                                    ref={lastNameRef}
                                    label="Last Name"
                                    value={formData.lastName}
                                    onChangeText={v => handleChange('lastName', v)}
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                    onSubmitEditing={() => usernameRef.current?.focus()}
                                    blurOnSubmit={false}
                                />

                                <FloatingLabelInput
                                    ref={usernameRef}
                                    label="Username"
                                    value={formData.username}
                                    onChangeText={v => handleChange('username', v)}
                                    autoCapitalize="none"
                                    autoCorrect={false}
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
    buttonContainer: { marginTop: 16, marginBottom: 16 },
});
