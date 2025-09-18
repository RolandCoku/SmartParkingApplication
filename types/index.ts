export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface UserCar {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  userId: number;
  userEmail: string;
  parkingSpaceId: number;
  parkingSpaceLabel: string;
  parkingLotId: number;
  parkingLotName: string;
  parkingLotAddress: string;
  vehiclePlate: string;
  vehicleType: 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'VAN';
  userGroup: 'REGULAR' | 'PREMIUM' | 'VIP';
  startTime: string;
  endTime: string;
  totalPrice: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  bookingReference: string;
  paymentMethodId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingSession {
  id: number;
  userId: number;
  userEmail: string;
  parkingSpaceId: number;
  parkingSpaceLabel: string;
  parkingLotId: number;
  parkingLotName: string;
  parkingLotAddress: string;
  vehiclePlate: string;
  vehicleType: 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'VAN';
  userGroup: 'REGULAR' | 'PREMIUM' | 'VIP';
  startedAt: string;
  endedAt?: string;
  billedAmount?: number;
  currency: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  sessionReference: string;
  paymentMethodId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasContent: boolean;
}
