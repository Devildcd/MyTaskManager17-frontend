import { Component, Inject, OnDestroy, OnInit } from '@angular/core';

import { Task } from '../../interfaces/task.interface';
import { Subject, takeUntil } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TaskService } from '../../services/task.service';
import { TaskData } from '../../interfaces/dialog-task-data.interface';
import { AlertService } from '../../../shared/services/alert.service';
import { ApiResponseShowData } from '../../interfaces/api-response.interface';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-task-show',
  standalone: true,
  imports: [MatDialogModule, MatCardModule],
  templateUrl: './task-show.component.html',
  styleUrl: './task-show.component.css',
})
export default class TaskShowComponent implements OnInit, OnDestroy {
  task!: Task;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    @Inject(MAT_DIALOG_DATA) public data: TaskData,
    private alertService: AlertService,
  ) {
    //console.log(data.id);
  }

  ngOnInit(): void {
    this.loadTask();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTask() {
    if (this.data.id) {
      this.taskService
        .getTask(this.data.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: ApiResponseShowData) => {
            this.task = response.data;
            //console.log(this.task);
            this.loading = true;
          },
          error: (error) => {
            switch (error.status) {
              case 401:
                // Error de autenticación
                this.alertService.showError(
                  'You are not authorized. Please log in.',
                  'Error 401',
                );
                break;

              case 403:
                // Acceso prohibido
                this.alertService.showError(
                  'Access denied. You do not have the required permissions.',
                  'Error 403',
                );
                break;

              case 404:
                // Recurso no encontrado
                this.alertService.showError(
                  'User not found. Please try again.',
                  'Error 404',
                );
                break;
              case 500:
                // Error interno del servidor
                this.alertService.showError(
                  'Server error. Please try again later.',
                  'Error 500',
                );
                break;

              default:
                // Error genérico
                this.alertService.showError(
                  'An unknown error occurred. Please try again.',
                  'Error',
                );
                break;
            }
            console.error('Error loading user:', error);
          },
        });
    } else {
      console.warn('No user ID provided');
    }
  }
}
