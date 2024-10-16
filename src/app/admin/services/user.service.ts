import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { User } from '../interfaces/user.interface';
import {
  ApiResponse,
  ApiResponseShowData,
} from '../interfaces/api-response.interface';
import { Task } from '../../tasks/interfaces/task.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<ApiResponse> {
    return this.http
      .get<ApiResponse>(`${this.baseUrl}/admin/users`)
      .pipe(catchError(this.handleError));
  }

  getUser(id: number | undefined): Observable<ApiResponseShowData> {
    return this.http
      .get<ApiResponseShowData>(`${this.baseUrl}/admin/user/${id}`)
      .pipe(catchError(this.handleError));
  }

  postUser(user: User): Observable<User> {
    return this.http
      .post<User>(`${this.baseUrl}/admin/user`, user)
      .pipe(catchError(this.handleError));
  }

  putUser(id: number | undefined, user: User): Observable<User> {
    return this.http
      .put<User>(`${this.baseUrl}/admin/user/${id}`, user)
      .pipe(catchError(this.handleError));
  }

  deleteUser(id: number): Observable<User> {
    return this.http
      .delete<User>(`${this.baseUrl}/admin/user/${id}`)
      .pipe(catchError(this.handleError));
  }

  getUserTasks(userId: number | undefined): Observable<Task[]> {
    return this.http
      .get<Task[]>(`${this.baseUrl}/admin/user/${userId}/tasks`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMsg = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMsg = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMsg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMsg));
  }
}
