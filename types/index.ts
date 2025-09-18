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

// Parking Lot Types
export interface ParkingLotSearchDTO {
  id: number;
  name: string;
  description: string;
  address: string;
  operatingHours: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  latitude: number;
  longitude: number;
  distanceKm?: number;
  publicAccess: boolean;
  hasChargingStations: boolean;
  hasDisabledAccess: boolean;
  hasCctv: boolean;
  covered: boolean;
  capacity: number;
  availableSpaces: number;
  availabilityPercentage: number;
  availabilityUpdatedAt: string;
  averageRating: number;
  totalReviews: number;
  availableSpaceTypes: string[];
}

export interface ParkingLotDetailDTO {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  latitude: number;
  longitude: number;
  publicAccess: boolean;
  hasChargingStations: boolean;
  hasDisabledAccess: boolean;
  hasCctv: boolean;
  covered: boolean;
  capacity: number;
  availableSpaces: number;
  occupiedSpaces: number;
  availabilityPercentage: number;
  availabilityUpdatedAt: string;
  parkingSpaces: ParkingSpaceSummaryDTO[];
  reviews: ReviewSummaryDTO[];
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingSpaceSummaryDTO {
  id: number;
  parkingLotId: number;
  parkingLotName: string;
  latitude: number;
  longitude: number;
  spaceType: 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'VAN' | 'DISABLED' | 'ELECTRIC';
  spaceStatus: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'OUT_OF_ORDER';
  label: string;
  description: string;
  hasSensor: boolean;
  sensorDeviceId?: number;
  lastStatusChangedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummaryDTO {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

export interface AvailabilityInfoDTO {
  lotId: number;
  availableSpaces: number;
  availabilityPercentage: number;
  availableSpaceTypes: string[];
}

// Booking DTOs
export interface BookingQuoteDTO {
  parkingSpaceId: number;
  vehicleType: 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'VAN';
  userGroup: 'REGULAR' | 'PREMIUM' | 'VIP';
  startTime: string;
  endTime: string;
}

export interface BookingRegistrationDTO {
  parkingSpaceId: number;
  vehiclePlate: string;
  vehicleType: 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'VAN';
  userGroup: 'REGULAR' | 'PREMIUM' | 'VIP';
  startTime: string;
  endTime: string;
  paymentMethodId?: string;
  notes?: string;
}

export interface BookingUpdateDTO {
  vehiclePlate?: string;
  vehicleType?: 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'VAN';
  userGroup?: 'REGULAR' | 'PREMIUM' | 'VIP';
  startTime?: string;
  endTime?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  paymentMethodId?: string;
  notes?: string;
}

// Money DTO
export interface Money {
  amount: number;
  currency: string;
}

// Rate Management Types
export interface LotRateAssignmentDTO {
  id: number;
  parkingLotId: number;
  ratePlanId: number;
  priority: number;
  effectiveFrom: string;
  effectiveTo: string;
  createdAt: string;
  updatedAt: string;
}
