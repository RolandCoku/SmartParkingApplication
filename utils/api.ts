import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { ApiResponse, Booking, PaginatedResponse, ParkingSession, User, UserCar } from '@/types';
import { getAccessToken } from './auth';

const API_BASE_URL = API_CONFIG.BASE_URL;

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || 'Request failed');
  }

  const data: ApiResponse<T> = await response.json();
  return data.data;
}

// User API functions
export const userApi = {
  async getCurrentUser(): Promise<User> {
    return makeRequest<User>(API_ENDPOINTS.ME);
  },

  async updateUser(userId: number, updateData: Partial<User>): Promise<User> {
    return makeRequest<User>(`${API_ENDPOINTS.USERS}/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  async getUserCars(page: number = 0, size: number = 10): Promise<PaginatedResponse<UserCar>> {
    return makeRequest<PaginatedResponse<UserCar>>(`${API_ENDPOINTS.USER_CARS}?page=${page}&size=${size}`);
  },

  async getUserCarById(carId: number): Promise<UserCar> {
    return makeRequest<UserCar>(`${API_ENDPOINTS.USER_CARS}/${carId}`);
  },
};

// Bookings API functions
export const bookingsApi = {
  async getUserBookings(page: number = 0, size: number = 10): Promise<PaginatedResponse<Booking>> {
    return makeRequest<PaginatedResponse<Booking>>(`${API_ENDPOINTS.BOOKINGS}?page=${page}&size=${size}`);
  },

  async getCurrentBookings(page: number = 0, size: number = 10): Promise<PaginatedResponse<Booking>> {
    return makeRequest<PaginatedResponse<Booking>>(`${API_ENDPOINTS.BOOKINGS_CURRENT}?page=${page}&size=${size}`);
  },

  async getBookingHistory(page: number = 0, size: number = 10): Promise<PaginatedResponse<Booking>> {
    return makeRequest<PaginatedResponse<Booking>>(`${API_ENDPOINTS.BOOKINGS_HISTORY}?page=${page}&size=${size}`);
  },

  async getBookingById(bookingId: number): Promise<Booking> {
    return makeRequest<Booking>(`${API_ENDPOINTS.BOOKINGS}/${bookingId}`);
  },

  async cancelBooking(bookingId: number): Promise<Booking> {
    return makeRequest<Booking>(`${API_ENDPOINTS.BOOKINGS}/${bookingId}/cancel`, {
      method: 'POST',
    });
  },
};

// Parking Sessions API functions
export const sessionsApi = {
  async getUserSessions(page: number = 0, size: number = 10): Promise<PaginatedResponse<ParkingSession>> {
    return makeRequest<PaginatedResponse<ParkingSession>>(`${API_ENDPOINTS.PARKING_SESSIONS}?page=${page}&size=${size}`);
  },

  async getActiveSessions(page: number = 0, size: number = 10): Promise<PaginatedResponse<ParkingSession>> {
    return makeRequest<PaginatedResponse<ParkingSession>>(`${API_ENDPOINTS.SESSIONS_ACTIVE}?page=${page}&size=${size}`);
  },

  async getSessionHistory(page: number = 0, size: number = 10): Promise<PaginatedResponse<ParkingSession>> {
    return makeRequest<PaginatedResponse<ParkingSession>>(`${API_ENDPOINTS.SESSIONS_HISTORY}?page=${page}&size=${size}`);
  },

  async getSessionById(sessionId: number): Promise<ParkingSession> {
    return makeRequest<ParkingSession>(`${API_ENDPOINTS.PARKING_SESSIONS}/${sessionId}`);
  },

  async stopSession(sessionId: number): Promise<ParkingSession> {
    return makeRequest<ParkingSession>(`${API_ENDPOINTS.PARKING_SESSIONS}/${sessionId}/stop`, {
      method: 'POST',
    });
  },

  async cancelSession(sessionId: number): Promise<ParkingSession> {
    return makeRequest<ParkingSession>(`${API_ENDPOINTS.PARKING_SESSIONS}/${sessionId}/cancel`, {
      method: 'POST',
    });
  },
};

export { ApiError };
