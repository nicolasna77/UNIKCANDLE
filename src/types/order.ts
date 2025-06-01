export interface OrderItem {
  id: string;
  name: string;
  imageUrl: string;
  scentName: string;
  quantity: number;
  price: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  banExpires: number | null;
  banReason: string | null;
  banned: boolean | null;
  role: string | null;
}

export interface Order {
  id: string;
  createdAt: Date;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  userId: string;
  user: User;
}
