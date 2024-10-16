import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Task } from '../interfaces/task.interface';
import { catchError, Observable, throwError } from 'rxjs';
import {
  ApiResponse,
  ApiResponseShowData,
} from '../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllTasks(): Observable<ApiResponse> {
    return this.http
      .get<ApiResponse>(`${this.baseUrl}/tasks`)
      .pipe(catchError(this.handleError));
  }

  getTask(id: number): Observable<ApiResponseShowData> {
    return this.http
      .get<ApiResponseShowData>(`${this.baseUrl}/task/${id}`)
      .pipe(catchError(this.handleError));
  }

  postTask(task: Task): Observable<Task> {
    return this.http
      .post<Task>(`${this.baseUrl}/task`, task)
      .pipe(catchError(this.handleError));
  }

  putTask(id: number | undefined, task: Task): Observable<Task> {
    return this.http
      .put<Task>(`${this.baseUrl}/task/${id}`, task)
      .pipe(catchError(this.handleError));
  }

  deleteTask(id: number): Observable<Task> {
    return this.http
      .delete<Task>(`${this.baseUrl}/task/${id}`)
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
