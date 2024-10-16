import { Component, Inject, OnDestroy, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { Subject, takeUntil } from 'rxjs';
import { ApiResponseShowData } from '../../interfaces/api-response.interface';
import { SharedService } from '../../../shared/services/shared.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Task } from '../../interfaces/task.interface';
import { TaskService } from '../../services/task.service';
import { TaskData } from '../../interfaces/dialog-task-data.interface';
import { AuthService } from '../../../auth/services/auth.service';
import { UserService } from '../../../admin/services/user.service';
import { User } from '../../../admin/interfaces/user.interface';

@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
  ],
  templateUrl: './task-edit.component.html',
  styleUrl: './task-edit.component.css',
})
export default class TaskEditComponent implements OnInit, OnDestroy {
  users: User[] = [];
  task!: Task;
  hide = true;
  private destroy$ = new Subject<void>();
  isSubmitting = false;
  isAdmin = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    @Inject(MAT_DIALOG_DATA) public data: TaskData,
    private sharedService: SharedService,
    private alertService: AlertService,
    public dialogRef: MatDialogRef<TaskEditComponent>,
    private authService: AuthService,
    private userService: UserService,
  ) {
    //console.log(data);
  }

  ngOnInit() {
    this.loadTask();
    this.checkRole();
    this.userService.getAllUsers().subscribe((response) => {
      this.users = response.data;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkRole() {
    this.isAdmin = this.authService.isAdmin();
    //console.log(this.isAdmin);
  }

  loadTask() {
    if (this.data.id) {
      this.taskService
        .getTask(this.data.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: ApiResponseShowData) => {
            this.task = response.data;
            this.formEdit.patchValue({
              name: response.data.name,
              description: response.data.description,
              status: response.data.status,
              user_id: response.data.user_id,
            });
            this.loading = true;
           // console.log(this.task);
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

  formEdit: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    status: ['pending'],
    description: ['', Validators.required],
    user_id: [null],
  });

  onEdit(): void {
    if (this.formEdit.invalid) {
      this.formEdit.markAllAsTouched();
      return;
    }
    if (this.formEdit.dirty) {
      const formData: Task = this.formEdit.value;
      const isStatusComplete = formData.status === 'complete';
      // console.log('Form Changes:', formData);

      this.taskService.putTask(this.task.id, formData).subscribe({
        next: () => {
          //console.log('User Updated:', response);
          this.sharedService.noticeElementCreated();
          if (isStatusComplete) {
            this.sharedService.notifyTaskStatusChanged(); // Notifica que una tarea fue completada
          }
          this.alertService.showSuccess(
            'Task updated successfully',
            'Success',
            {
              timeOut: 3000,
            },
          );
          this.dialogRef.close();
        },
        error: (error) => {
          this.isSubmitting = false;
          switch (error.status) {
            case 400:
              // Error de validación o bad request
              this.alertService.showError(
                'Validation error. Please check your input.',
                'Error 400',
              );
              break;

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

            case 422:
              // Error de validación en el backend
              this.alertService.showError(
                'Unprocessable entity. Check your input.',
                'Error 422',
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
          console.error('Error updating user:', error);
        },
        complete: () => {
          this.formEdit.markAsPristine();
        },
      });
    } else {
      //console.log('No Changes');
    }
  }
}
