import { Component } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export default class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
      role: ['user'],
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.registerForm.value;
    //console.log(formData);

    this.authService.register(formData).subscribe({
      next: (response) => {
        this.alertService.showSuccess(
          `User successfully registered! Welcome, ${response.user.name}!`,
          'Success',
        );
        this.registerForm.reset();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.alertService.showError(err.message, 'Registration Error');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
