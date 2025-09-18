import * as SecureStore from 'expo-secure-store';
import { authDebugError, authDebugLog } from '../config/debug';

// Import ApiError type for the utility function
interface ApiError {
  status: number;
  message: string;
}

const API_BASE = 'http://192.168.252.60:8080';

// Updated interface to match API TokenResponseDTO
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
    issuedAt: number;
}

// Registration data structure to match API UserRegistrationDTO
export interface UserRegistration {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    phoneNumber: string;
}

// In-memory (session) token storage. These are lost when the app process exits.
let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

// Helper key names
const STORAGE_KEYS = {
  access: 'accessToken',
  refresh: 'refreshToken',
  remember: 'rememberMe'
};

export async function login(username: string, password: string, remember: boolean = true): Promise<TokenResponse> {
    authDebugLog('Attempting login to:', `${API_BASE}/api/v1/auth/login`);
    
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password}),
    });
    
    authDebugLog('Login response status:', res.status);
    authDebugLog('Login response headers:', res.headers);
    
    if (!res.ok) {
        const errorText = await res.text();
        authDebugError('Login failed:', errorText);
        
        // Try to parse the error response to extract the message
        let errorMessage = 'Login failed';
        try {
            const errorData = JSON.parse(errorText);
            authDebugLog('Parsed error data:', errorData);
            errorMessage = errorData.message || 'Login failed';
            authDebugLog('Extracted error message:', errorMessage);
        } catch (parseError) {
            authDebugError('Failed to parse error response:', parseError);
            // If parsing fails, use the original error text
            errorMessage = `Login failed: ${res.status} - ${errorText}`;
        }
        
        throw new Error(errorMessage);
    }
    
    const data = await res.json();
    authDebugLog('Login successful, saving tokens');
    await saveTokens(data.data, remember); // API returns { success, message, data: TokenResponseDTO }
    return data.data;
}

export interface RegisterResult {
    success: boolean;
    data?: any;
    error?: string;
}

export async function register(user: UserRegistration): Promise<RegisterResult> {
    try {
        authDebugLog('Attempting registration to:', `${API_BASE}/api/v1/auth/register`);
        const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(user),
        });
        authDebugLog('Registration response status:', res.status);
        const data = await res.json();
        if (!res.ok) {
            authDebugError('Registration failed:', data?.message || 'Unknown error');
            return { success: false, error: data?.message || 'Registration failed' };
        }
        authDebugLog('Registration successful');
        // For register, we get UserResponseDTO, not TokenResponseDTO
        return { success: true, data: data.data };
    } catch (err: any) {
        authDebugError('Registration error:', err);
        return { success: false, error: err?.message || 'Registration failed' };
    }
}

export async function refreshToken(): Promise<TokenResponse> {
    // Use in-memory refresh token first if present, otherwise check AsyncStorage
    const sessionRefresh = inMemoryRefreshToken;
    const storedRefresh = sessionRefresh ? sessionRefresh : await SecureStore.getItemAsync(STORAGE_KEYS.refresh);
    if (!storedRefresh) throw new Error('No refresh token');

    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({refreshToken: storedRefresh}),
    });
    if (!res.ok) throw new Error('Token refresh failed');
    const data = await res.json();

    // Determine whether tokens were persistent before (remember flag in storage)
    const rememberFlag = await SecureStore.getItemAsync(STORAGE_KEYS.remember);
    const remember = rememberFlag === '1';

    await saveTokens(data.data, remember);
    return data.data;
}

export async function saveTokens(tokens: TokenResponse, remember: boolean = true) {
    if (remember) {
        // Persist tokens securely to SecureStore
        await SecureStore.setItemAsync(STORAGE_KEYS.access, tokens.accessToken);
        await SecureStore.setItemAsync(STORAGE_KEYS.refresh, tokens.refreshToken);
        await SecureStore.setItemAsync(STORAGE_KEYS.remember, '1');
        // Clear any in-memory session tokens
        inMemoryAccessToken = null;
        inMemoryRefreshToken = null;
    } else {
        // Session-only: store tokens in memory and remove persisted tokens
        inMemoryAccessToken = tokens.accessToken;
        inMemoryRefreshToken = tokens.refreshToken;
        try {
            await SecureStore.deleteItemAsync(STORAGE_KEYS.access);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.refresh);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.remember);
        } catch (e) {
            // ignore secure store delete errors
        }
    }
}

export async function getAccessToken(): Promise<string | null> {
    // Prefer in-memory session token, fallback to persisted token
    if (inMemoryAccessToken) return inMemoryAccessToken;
    try {
        return await SecureStore.getItemAsync(STORAGE_KEYS.access);
    } catch (e) {
        return null;
    }
}

export async function getRefreshToken(): Promise<string | null> {
    if (inMemoryRefreshToken) return inMemoryRefreshToken;
    try {
        return await SecureStore.getItemAsync(STORAGE_KEYS.refresh);
    } catch (e) {
        return null;
    }
}

export async function clearSessionTokens() {
    // Clear only in-memory session tokens (do not touch persisted tokens)
    inMemoryAccessToken = null;
    inMemoryRefreshToken = null;
}

export async function isRemembered(): Promise<boolean> {
    try {
        const val = await SecureStore.getItemAsync(STORAGE_KEYS.remember);
        return val === '1';
    } catch {
        return false;
    }
}

export async function logout() {
    // Clear both persisted and in-memory tokens
    inMemoryAccessToken = null;
    inMemoryRefreshToken = null;
    try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.access);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.refresh);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.remember);
    } catch (e) {
        // ignore secure store delete errors
    }
}

export async function authenticatedFetch(url: string, options: any = {}) {
    let accessToken = await getAccessToken();
    if (!accessToken) throw new Error('No access token');
    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${accessToken}`;
    let res = await fetch(url, options);
    
    if (res.status === 401) {
        try {
            // Try to refresh the token
            await refreshToken();
            accessToken = await getAccessToken();
            if (!accessToken) throw new Error('Failed to get new access token');
            
            options.headers['Authorization'] = `Bearer ${accessToken}`;
            res = await fetch(url, options);
        } catch (refreshError) {
            // Refresh failed - clear all tokens and throw error
            authDebugError('Token refresh failed:', refreshError);
            await logout();
            throw new Error('Session expired. Please login again.');
        }
    }
    
    return res;
}

// Utility function to check if an error indicates session expiry
export function isSessionExpiredError(error: any): boolean {
    if (error instanceof Error) {
        return error.message.includes('Session expired') || 
               error.message.includes('Please login again') ||
               error.message.includes('No access token');
    }
    if (error instanceof ApiError) {
        return error.message.includes('Session expired') || 
               error.message.includes('Please login again') ||
               error.status === 401;
    }
    return false;
}

