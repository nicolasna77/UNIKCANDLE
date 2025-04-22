export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BanForm {
  userId: string;
  reason: string;
  expirationDate?: Date;
}

export interface UserForm {
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
}
