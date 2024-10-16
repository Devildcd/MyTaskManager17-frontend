import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { User } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';

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
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { SharedService } from '../../../shared/services/shared.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
  ],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.css',
})
export default class UserCreateComponent {
  user!: User;
  isSubmitting = false;
  hide = true;

  constructor(
    private fb: FormBuilder,
    private userSevice: UserService,
    private sharedService: SharedService,
    private alertService: AlertService,
    public dialogRef: MatDialogRef<UserCreateComponent>,
  ) {}

  formCreate: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
      ],
    ],
    role: ['user', Validators.required],
  });

  onSave(): void {
    if (this.formCreate.invalid) {
      this.formCreate.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formData = this.formCreate.value;
    //console.log(formData);

    this.userSevice.postUser(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.formCreate.reset();
        this.sharedService.noticeElementCreated();
        this.alertService.showSuccess('User created successfully', 'Success', {
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
