/**
 * Debug Configuration
 * 
 * This file controls debug logging throughout the application.
 * Modify the DEBUG_MODE constant based on your needs:
 * 
 * Development: DEBUG_MODE = true (or use __DEV__)
 * Production: DEBUG_MODE = false
 * Testing: DEBUG_MODE = true
 */

// Global debug flag
export const DEBUG_MODE = __DEV__; // Automatically true in development, false in production builds

// Debug logging utilities
export const debugLog = (message: string, ...args: any[]) => {
    if (DEBUG_MODE) {
        console.log(`[DEBUG] ${message}`, ...args);
    }
};

export const debugError = (message: string, ...args: any[]) => {
    if (DEBUG_MODE) {
        console.error(`[ERROR] ${message}`, ...args);
    }
};

export const debugWarn = (message: string, ...args: any[]) => {
    if (DEBUG_MODE) {
        console.warn(`[WARN] ${message}`, ...args);
    }
};

// Auth-specific debug utilities
export const authDebugLog = (message: string, ...args: any[]) => {
    if (DEBUG_MODE) {
        console.log(`[AUTH DEBUG] ${message}`, ...args);
    }
};

export const authDebugError = (message: string, ...args: any[]) => {
    if (DEBUG_MODE) {
        console.error(`[AUTH ERROR] ${message}`, ...args);
    }
};
