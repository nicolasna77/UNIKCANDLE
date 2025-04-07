export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: User;
}

export interface Scent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  model3dUrl: string;
}

export interface ProductVariant {
  id: string;
  scentId: string;
  scent: Scent;
}

export interface ProductWithDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  variants: ProductVariant[];
  reviews: Review[];
  averageRating?: number;
  reviewCount?: number;
}

export interface SessionData {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}
