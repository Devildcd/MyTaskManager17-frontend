import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  AuthResponse,
  RegisterResponse,
} from '../interfaces/auth-response.interface';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { User } from '../../admin/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(
    email: string,
    name: string,
    password: string,
  ): Observable<AuthResponse> {
    const body = { email, name, password };

    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, body).pipe(
      map((response: AuthResponse) => {
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response;
      }),
      catchError((error) => {
        console.error('Login error', error);
        return throwError(
          () => new Error('Error during login: ' + error.message),
        );
      }),
    );
  }

  register(userData: User): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(`${this.baseUrl}/register`, userData)
      .pipe(
        map((response: RegisterResponse) => {
          if (response.access_token) {
            localStorage.setItem('auth_token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          return response;
        }),
        catchError(this.handleError),
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 422:
          errorMessage = 'Validation error: ' + error.error.msg;
          break;
        case 500:
          errorMessage = 'Server error: ' + error.error.msg;
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.error.msg}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  isLoggedIn(): Observable<boolean> {
    const token = localStorage.getItem('auth_token');
    return of(!!token);
  }

  getUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  getUserRole(): string | null {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user).role;
    }
    return null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  isUser(): boolean {
    return this.getUserRole() === 'user';
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }
}
