import { authDebugError } from '../config/debug';
import { getAccessToken, logout, refreshToken } from './auth';

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
