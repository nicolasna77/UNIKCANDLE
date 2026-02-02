export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | null;
  banned: boolean;
  banReason?: string;
  banExpires?: number | null;
  createdAt: string;
  updatedAt: string;
  image?: string;
  emailVerified: boolean;
  orderCount: number;
  reviewCount: number;
  totalSpent: number;
}

export interface UserStats {
  total: number;
  admins: number;
  banned: number;
  unverified: number;
  active: number;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: UserStats;
}
