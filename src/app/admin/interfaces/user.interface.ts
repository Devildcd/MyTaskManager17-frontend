import { Task } from 'zone.js/lib/zone-impl';

export interface User {
  id?: number | undefined;
  name: string;
  email: string;
  password?: string;
  role: string;
  tasks?: Task;
}
