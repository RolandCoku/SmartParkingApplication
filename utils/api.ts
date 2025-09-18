import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import {
  ApiResponse,
  Booking,
  BookingQuoteDTO,
  BookingRegistrationDTO,
  BookingUpdateDTO,
  LotRateAssignmentDTO,
  Money,
  PaginatedResponse,
  ParkingLotDetailDTO,
  ParkingLotSearchDTO,
  ParkingSession,
  ParkingSpaceSummaryDTO,
  User,
  UserCar
} from '@/types';
import { ApiError } from './errors';
import { authenticatedFetch } from './http';

const API_BASE_URL = API_CONFIG.BASE_URL;

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await authenticatedFetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || 'Request failed');
    }

    const data: ApiResponse<T> = await response.json();
    return data.data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout');
    }
    throw error;
  }
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

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    return makeRequest<void>('/me/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
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

  async getBookingByReference(reference: string): Promise<Booking> {
    return makeRequest<Booking>(`${API_ENDPOINTS.BOOKINGS}/reference/${reference}`);
  },

  async createBooking(bookingData: BookingRegistrationDTO): Promise<Booking> {
    return makeRequest<Booking>(API_ENDPOINTS.BOOKINGS, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  async updateBooking(bookingId: number, updateData: BookingUpdateDTO): Promise<Booking> {
    return makeRequest<Booking>(`${API_ENDPOINTS.BOOKINGS}/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  async cancelBooking(bookingId: number): Promise<Booking> {
    return makeRequest<Booking>(`${API_ENDPOINTS.BOOKINGS}/${bookingId}/cancel`, {
      method: 'POST',
    });
  },

  async startBooking(bookingId: number): Promise<Booking> {
    return makeRequest<Booking>(`${API_ENDPOINTS.BOOKINGS}/${bookingId}/start`, {
      method: 'POST',
    });
  },

  async completeBooking(bookingId: number): Promise<Booking> {
    return makeRequest<Booking>(`${API_ENDPOINTS.BOOKINGS}/${bookingId}/complete`, {
      method: 'POST',
    });
  },

  async extendBooking(bookingId: number, newEndTime: string): Promise<Booking> {
    return makeRequest<Booking>(`${API_ENDPOINTS.BOOKINGS}/${bookingId}/extend?newEndTime=${newEndTime}`, {
      method: 'POST',
    });
  },

  async getBookingQuote(quoteData: BookingQuoteDTO): Promise<Money> {
    return makeRequest<Money>(`${API_ENDPOINTS.BOOKINGS}/quote`, {
      method: 'POST',
      body: JSON.stringify(quoteData),
    });
  },

  async checkAvailability(spaceId: number, startTime: string, endTime: string): Promise<boolean> {
    return makeRequest<boolean>(`${API_ENDPOINTS.BOOKINGS}/availability?spaceId=${spaceId}&startTime=${startTime}&endTime=${endTime}`);
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

// Parking API functions
export const parkingApi = {
  // Parking Lots
  async getAllParkingLots(page: number = 0, size: number = 10): Promise<PaginatedResponse<ParkingLotSearchDTO>> {
    return makeRequest<PaginatedResponse<ParkingLotSearchDTO>>(`/parking/lots?page=${page}&size=${size}`);
  },

  async getParkingLotById(lotId: number): Promise<ParkingLotDetailDTO> {
    return makeRequest<ParkingLotDetailDTO>(`/parking/lots/${lotId}`);
  },

  async findNearbyParkingLots(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 5.0, 
    page: number = 0, 
    size: number = 10
  ): Promise<PaginatedResponse<ParkingLotSearchDTO>> {
    return makeRequest<PaginatedResponse<ParkingLotSearchDTO>>(
      `/parking/lots/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}&page=${page}&size=${size}`
    );
  },

  async findAvailableParkingLots(page: number = 0, size: number = 10): Promise<PaginatedResponse<ParkingLotSearchDTO>> {
    return makeRequest<PaginatedResponse<ParkingLotSearchDTO>>(`/parking/lots/available?page=${page}&size=${size}`);
  },

  async searchParkingLots(query: string, page: number = 0, size: number = 10): Promise<PaginatedResponse<ParkingLotSearchDTO>> {
    return makeRequest<PaginatedResponse<ParkingLotSearchDTO>>(`/parking/lots/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
  },

  async filterParkingLots(
    filters: {
      hasChargingStations?: boolean;
      hasDisabledAccess?: boolean;
      hasCctv?: boolean;
      covered?: boolean;
    },
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<ParkingLotSearchDTO>> {
    const params = new URLSearchParams();
    if (filters.hasChargingStations !== undefined) params.append('hasChargingStations', filters.hasChargingStations.toString());
    if (filters.hasDisabledAccess !== undefined) params.append('hasDisabledAccess', filters.hasDisabledAccess.toString());
    if (filters.hasCctv !== undefined) params.append('hasCctv', filters.hasCctv.toString());
    if (filters.covered !== undefined) params.append('covered', filters.covered.toString());
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    return makeRequest<PaginatedResponse<ParkingLotSearchDTO>>(`/parking/lots/filter?${params.toString()}`);
  },

  // Parking Spaces
  async getParkingSpaceById(spaceId: number): Promise<ParkingSpaceSummaryDTO> {
    return makeRequest<ParkingSpaceSummaryDTO>(`/parking/spaces/${spaceId}`);
  },

  async getParkingSpacesByLotId(lotId: number, page: number = 0, size: number = 10): Promise<PaginatedResponse<ParkingSpaceSummaryDTO>> {
    return makeRequest<PaginatedResponse<ParkingSpaceSummaryDTO>>(`/parking/spaces/lot/${lotId}?page=${page}&size=${size}`);
  },

  async getAvailableParkingSpacesByLotId(lotId: number, page: number = 0, size: number = 10): Promise<PaginatedResponse<ParkingSpaceSummaryDTO>> {
    return makeRequest<PaginatedResponse<ParkingSpaceSummaryDTO>>(`/parking/spaces/lot/${lotId}/available?page=${page}&size=${size}`);
  },

  async findNearbyAvailableSpaces(
    latitude: number,
    longitude: number,
    radiusKm: number = 2.0,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<ParkingSpaceSummaryDTO>> {
    return makeRequest<PaginatedResponse<ParkingSpaceSummaryDTO>>(
      `/parking/spaces/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}&page=${page}&size=${size}`
    );
  },

  async findParkingSpacesByType(spaceType: string, page: number = 0, size: number = 10): Promise<PaginatedResponse<ParkingSpaceSummaryDTO>> {
    return makeRequest<PaginatedResponse<ParkingSpaceSummaryDTO>>(`/parking/spaces/by-type/${spaceType}?page=${page}&size=${size}`);
  },
};

// Rate Management API functions
export const rateApi = {
  async getLotRateAssignmentsByLotId(
    lotId: number, 
    page: number = 0, 
    size: number = 10, 
    sortBy: string = 'priority,desc'
  ): Promise<PaginatedResponse<LotRateAssignmentDTO>> {
    return makeRequest<PaginatedResponse<LotRateAssignmentDTO>>(
      `/admin/rates/lots/${lotId}/rate-assignments?page=${page}&size=${size}&sort=${sortBy}`
    );
  },
};

export { ApiError };

