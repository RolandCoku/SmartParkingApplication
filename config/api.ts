// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://192.168.252.60:8080/api/v1',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  // User endpoints
  ME: '/me',
  USERS: '/users',
  USER_CARS: '/me/cars',
  
  // Booking endpoints
  BOOKINGS: '/bookings',
  BOOKINGS_CURRENT: '/bookings/current',
  BOOKINGS_HISTORY: '/bookings/history',
  
  // Session endpoints
  PARKING_SESSIONS: '/parking-sessions',
  SESSIONS_ACTIVE: '/parking-sessions/active',
  SESSIONS_HISTORY: '/parking-sessions/history',
  
  // Car endpoints
  CARS: '/cars',
} as const;
