import { colors } from '@/constants/SharedStyles';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet } from 'react-native';
import { clearSessionTokens, getAccessToken, isRemembered } from '../utils/auth';

export default function RootLayout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const appState = useRef<AppStateStatus | null>(null);

  useEffect(() => {
    checkAuthStatus();

    appState.current = AppState.currentState;
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // If moving to background/inactive, clear session tokens if user did not choose remember
    if (appState.current && appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
      try {
        const remembered = await isRemembered();
        if (!remembered) {
          await clearSessionTokens();
        }
      } catch (e) {
        // ignore
      }
    }
    appState.current = nextAppState;
  };

  const checkAuthStatus = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    } catch (error) {
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything until we've checked auth - no loading screen
  // if (isLoading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color={colors.primary} />
  //     </View>
  //   );
  // }

  return (
    <Stack
      screenOptions={{
        gestureEnabled: false,
        animation: 'none',
        animationDuration: 0,
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      <Stack.Screen name="register" options={{ gestureEnabled: false }} />
      <Stack.Screen name="home" options={{ gestureEnabled: false }} />
      <Stack.Screen name="charging-map" options={{ gestureEnabled: false }} />
      <Stack.Screen name="available-spots" options={{ gestureEnabled: false }} />
      <Stack.Screen name="bookings" options={{ gestureEnabled: false }} />
      <Stack.Screen name="parking-details" options={{ 
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
        headerShown: false,
      }} />
      <Stack.Screen name="booking" options={{ 
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
        headerShown: false,
      }} />
      <Stack.Screen name="profile" options={{ gestureEnabled: false }} />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'slide_from_right',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="add-payment-method" 
        options={{ 
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'slide_from_right',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="booking-details" 
        options={{ 
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'slide_from_right',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="my-vehicles" 
        options={{ 
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'slide_from_right',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="register-vehicle" 
        options={{ 
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'slide_from_right',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="edit-vehicle" 
        options={{ 
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'slide_from_right',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="payment-methods" 
        options={{ 
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'slide_from_right',
          headerShown: false,
        }} 
      />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
