import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor(private authService: AuthService) {}

  // Logica para el estado al crear o editar desde los dialog
  private elementCreated = new Subject<void>();
  elementCreated$: Observable<void> = this.elementCreated.asObservable();

  noticeElementCreated() {
    this.elementCreated.next();
  }

  // Logica para el estado al marcar la tarea como completada
  private completedTaskSource = new BehaviorSubject<void | null>(null);
  completedTask$ = this.completedTaskSource.asObservable();

  // Notificar que una tarea fue completada
  notifyTaskStatusChanged(): void {
    const user = this.authService.getUser();
    if (user && typeof user.id === 'number') {
      this.incrementCompletedTasksForUser(user.id);
    }
    this.completedTaskSource.next();
  }

  // Incrementar las tareas completadas del usuario autenticado
  private incrementCompletedTasksForUser(userId: number): void {
    const completedTasks = JSON.parse(
      localStorage.getItem('completedTasks') || '{}',
    );
    completedTasks[userId] = (completedTasks[userId] || 0) + 1;
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
  }

  // Obtener las tareas completadas desde el localStorage
  getCompletedTasksForUser(userId: number): number {
    const completedTasks = JSON.parse(
      localStorage.getItem('completedTasks') || '{}',
    );
    return completedTasks[userId] || 0;
  }
}
