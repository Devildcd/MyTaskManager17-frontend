import { User } from '../../admin/interfaces/user.interface';

export interface Task {
  id?: number | undefined;
  user_id: number;
  name: string;
  description: string;
  status: string;
  user: User;
}
