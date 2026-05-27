export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'VIEWER';
  createdAt?: string;
  isActive?: boolean;
}

export interface EntityType {
  id: string;
  code: string;
  label: string;
  icon?: string;
}

export interface Entity {
  id: string;
  entityTypeId: string;
  name: string;
  description?: string;
  entityType: EntityType;
  createdAt: string;
  updatedAt: string;
  _count?: { credentials: number };
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Credential {
  id: string;
  entityId: string;
  title: string;
  urlOrIp?: string;
  username: string;
  expiryDate?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
  entity: Entity;
  tags: { tag: Tag }[];
  owner?: { id: string; name: string; email: string };
}

export interface DashboardStats {
  totalEntities: number;
  totalCredentials: number;
  expiringSoon: number;
  recentlyUpdated: Credential[];
}

export interface ActivityLog {
  id: string;
  userId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  user?: { name: string; email: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  avoidSimilar: boolean;
}
