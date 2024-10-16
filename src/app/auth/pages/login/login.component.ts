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
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export default class LoginComponent {
  loginForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const { email, name, password } = this.loginForm.value;
    //console.log(this.loginForm.value);

    this.authService.login(email, name, password).subscribe({
      next: (response) => {
        this.alertService.showSuccess(response.msg, 'Login Success');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.alertService.showError(error.message, 'Login Failed');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
