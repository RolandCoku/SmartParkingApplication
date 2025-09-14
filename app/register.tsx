import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'login',
};

export const options = {
  gestureEnabled: false,
  headerShown: false,
};

export default function RegisterScreen() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the first step of registration
        router.replace('/register/personal-info');
    }, []);

    return null; // This component just redirects
}
