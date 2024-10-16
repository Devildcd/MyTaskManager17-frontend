import { Component, Inject } from '@angular/core';

import { Task } from '../../interfaces/task.interface';
import { TaskService } from '../../services/task.service';
import { UserData } from '../../../admin/interfaces/dialog-user-data.interface';

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
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-task-create',
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
  templateUrl: './task-create.component.html',
  styleUrl: './task-create.component.css',
})
export default class TaskCreateComponent {
  task!: Task;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    @Inject(MAT_DIALOG_DATA) public data: UserData,
    private alertService: AlertService,
    public dialogRef: MatDialogRef<TaskCreateComponent>,
  ) {
    //console.log(data);
  }

  formCreate: FormGroup = this.fb.group({
    user_id: [null],
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    status: ['pending', Validators.required],
  });

  onSave(): void {
    if (this.formCreate.invalid) {
      this.formCreate.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.formCreate.patchValue({ user_id: this.data.id });
    const formData = this.formCreate.value;
    //console.log(formData);

    this.taskService.postTask(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.formCreate.reset();
        this.alertService.showSuccess('Task created successfully', 'Success', {
          timeOut: 3000,
        });
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
        console.error('Error creating user:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
