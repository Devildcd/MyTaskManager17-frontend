import { User } from './user.interface';

export interface ApiResponse {
  data: User[];
  current_page: number;
  total: number;
  message: string;
}

export interface ApiResponseShowData {
  data: User;
  message: string;
}
