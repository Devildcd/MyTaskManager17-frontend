import { AuthUser } from './auth-user.interface';

export interface AuthResponse {
  status: number;
  msg: string;
  access_token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  status: number;
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  msg: string;
}
