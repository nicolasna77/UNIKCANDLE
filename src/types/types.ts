export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface SessionData {
  user?: User;
  expires: Date;
}
