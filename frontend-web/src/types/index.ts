export type UserType = 'CLIENT' | 'PROFESSIONAL';

export type ServiceType = 'REPAIR' | 'RENOVATION' | 'CONSTRUCTION';

export type UrgencyLevel = 'URGENT' | 'THIS_WEEK' | 'THIS_MONTH' | 'FLEXIBLE';

export type RequestStatus =
  | 'ACTIVE'
  | 'IN_PROGRESS'
  | 'ON_THE_WAY'
  | 'WORKING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  userType: UserType;
  profilePhotoUrl?: string;
  companyName?: string;
  description?: string;
  averageRating?: number;
  totalReviews?: number;
  isVerified: boolean;
}

export interface Category {
  id: number;
  name: string;
  iconName: string;
  serviceType: ServiceType;
  isActive: boolean;
}

export interface RepairRequest {
  id: number;
  client: User;
  category: Category;
  problemType: string;
  problemDescription?: string;
  urgency: UrgencyLevel;
  city: string;
  zone: string;
  exactAddress?: string;
  status: RequestStatus;
  mediaUrls: string[];
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepairOffer {
  id: number;
  request: RepairRequest;
  professional: User;
  partsOption: 'PROFESSIONAL_BRINGS' | 'PLATFORM_PROVIDES' | 'CLIENT_HAS';
  partsDescription?: string;
  partsPrice?: number;
  laborPrice: number;
  totalPrice: number;
  estimatedDurationMinutes?: number;
  arrivalTime?: string;
  notes?: string;
  status: OfferStatus;
  validUntil?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  userType: UserType;
  companyName?: string;
  description?: string;
  categoryIds?: number[];
  zones?: string[];
}

export interface CreateRepairRequest {
  categoryId: number;
  problemType: string;
  problemDescription?: string;
  urgencyLevel: UrgencyLevel;
  city: string;
  zone: string;
  address?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  estimatedBudget?: number;
  needsInspection?: boolean;
  clientProvidesParts?: boolean;
  mediaUrls?: string[];
}
