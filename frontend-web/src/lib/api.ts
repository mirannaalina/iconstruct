import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Category,
  RepairRequest,
  CreateRepairRequest,
  RepairOffer,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/api/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/api/auth/register', data),
};

// Categories API
export const categoriesApi = {
  getAll: () =>
    api.get<Category[]>('/api/categories'),

  getByType: (serviceType: string) =>
    api.get<Category[]>(`/api/categories/by-type/${serviceType}`),
};

// Repair Requests API
export const repairRequestsApi = {
  create: (data: CreateRepairRequest) =>
    api.post<RepairRequest>('/api/repair-requests', data),

  getMyRequests: (page = 0, size = 10) =>
    api.get<{ content: RepairRequest[]; totalPages: number }>(
      `/api/repair-requests/my-requests?page=${page}&size=${size}`
    ),

  getAvailable: () =>
    api.get<RepairRequest[]>('/api/repair-requests/available'),

  getMyJobs: () =>
    api.get<RepairRequest[]>('/api/repair-requests/my-jobs'),

  getById: (id: number) =>
    api.get<RepairRequest>(`/api/repair-requests/${id}`),
};

// Offers API
export const offersApi = {
  create: (requestId: number, data: Partial<RepairOffer>) =>
    api.post<RepairOffer>(`/api/repair-requests/${requestId}/offers`, data),

  getForRequest: (requestId: number) =>
    api.get<RepairOffer[]>(`/api/repair-requests/${requestId}/offers`),

  accept: (offerId: number) =>
    api.post(`/api/offers/${offerId}/accept`),

  reject: (offerId: number) =>
    api.post(`/api/offers/${offerId}/reject`),
};

// Messages API
export const messagesApi = {
  getForRequest: (requestId: number) =>
    api.get(`/api/messages/request/${requestId}`),

  send: (requestId: number, content: string) =>
    api.post(`/api/messages/request/${requestId}`, { content }),

  getUnreadCount: (requestId: number) =>
    api.get<number>(`/api/messages/request/${requestId}/unread-count`),
};

export default api;
