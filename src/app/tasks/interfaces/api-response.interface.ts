import { Task } from './task.interface';

export interface ApiResponse {
  data: Task[];
  current_page: number;
  total: number;
  message: string;
}

export interface ApiResponseShowData {
  data: Task;
  message: string;
}
