import { Component, Inject, OnDestroy, OnInit } from '@angular/core';

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
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { UserData } from '../../interfaces/dialog-user-data.interface';
import { Subject, takeUntil } from 'rxjs';
import { ApiResponseShowData } from '../../interfaces/api-response.interface';
import { SharedService } from '../../../shared/services/shared.service';
import { AlertService } from '../../../shared/services/alert.service';
import UserCreateComponent from '../user-create/user-create.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-user-edit',
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
    LoaderComponent,
  ],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css',
})
export default class UserEditComponent implements OnInit, OnDestroy {
  user!: User;
  hide = true;
  private destroy$ = new Subject<void>();
  loading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: UserData,
    private sharedService: SharedService,
    private alertService: AlertService,
    public dialogRef: MatDialogRef<UserCreateComponent>,
  ) {
    console.log(data);
  }

  ngOnInit() {
    this.loadUser();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUser() {
    if (this.data.id) {
      this.userService
        .getUser(this.data.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: ApiResponseShowData) => {
            this.user = response.data;
            this.formEdit.patchValue({
              name: response.data.name,
              email: response.data.email,
              role: response.data.role,
            });
            this.loading = true;
            //console.log(this.user);
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
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
      ],
    ],
    role: ['user', Validators.required],
  });

  onEdit(): void {
    if (this.formEdit.invalid) {
      this.formEdit.markAllAsTouched();
      return;
    }
    if (this.formEdit.dirty) {
      const formData: User = {
        name: this.formEdit.get('name')?.value,
        email: this.formEdit.get('email')?.value,
        role: this.formEdit.get('role')?.value,
      };
      const password = this.formEdit.get('password')?.value;
      if (password) {
        formData.password = password;
      }
      //console.log('Form Changes:', formData);

      this.userService.putUser(this.user.id, formData).subscribe({
        next: (response) => {
          //console.log('User Updated:', response);
          this.sharedService.noticeElementCreated();
          this.alertService.showSuccess(
            'User updated successfully',
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
          // Opcionalmente, puedes resetear el formulario
          this.formEdit.markAsPristine();
        },
      });
    } else {
      //console.log('No Changes');
    }
  }
}
