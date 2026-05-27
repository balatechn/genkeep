import api from './client';
import type { User, Entity, EntityType, Credential, DashboardStats, ActivityLog, PaginatedResponse, GeneratorOptions } from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/login', { email, password }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get<User>('/auth/me'),
};

export const reportsApi = {
  dashboard: () => api.get<DashboardStats>('/reports/dashboard'),
  expiry: (days?: number) => api.get<Credential[]>(`/reports/expiry${days ? `?days=${days}` : ''}`),
  logs: (params?: Record<string, string>) => api.get<PaginatedResponse<ActivityLog>>('/reports/logs', { params }),
};

export const entityTypesApi = {
  list: () => api.get<EntityType[]>('/entities/types'),
};

export const entitiesApi = {
  list: (params?: Record<string, string>) => api.get<Entity[]>('/entities', { params }),
  get: (id: string) => api.get<Entity>(`/entities/${id}`),
  create: (data: { entityTypeId: string; name: string; description?: string }) =>
    api.post<Entity>('/entities', data),
  update: (id: string, data: Partial<{ name: string; description: string }>) =>
    api.put<Entity>(`/entities/${id}`, data),
  delete: (id: string) => api.delete(`/entities/${id}`),
};

export const credentialsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Credential>>('/credentials', { params }),
  get: (id: string) => api.get<Credential>(`/credentials/${id}`),
  reveal: (id: string) => api.post<{ password: string; notes?: string }>(`/credentials/${id}/reveal`),
  create: (data: unknown) => api.post<Credential>('/credentials', data),
  update: (id: string, data: unknown) => api.put<Credential>(`/credentials/${id}`, data),
  delete: (id: string) => api.delete(`/credentials/${id}`),
};

export const toolsApi = {
  generatePassword: (opts: Partial<GeneratorOptions>) =>
    api.post<{ password: string }>('/tools/generate-password', opts),
};

export const usersApi = {
  list: () => api.get<User[]>('/users'),
  create: (data: unknown) => api.post<User>('/users', data),
  update: (id: string, data: unknown) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};
