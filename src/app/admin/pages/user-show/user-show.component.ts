import {
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

import { UserService } from '../../services/user.service';
import { UserData } from '../../interfaces/dialog-user-data.interface';

import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Task } from '../../../tasks/interfaces/task.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { ApiResponseShowData } from '../../interfaces/api-response.interface';
import { User } from '../../interfaces/user.interface';
import { Subject, takeUntil } from 'rxjs';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-user-show',
  standalone: true,
  imports: [MatDialogModule, MatTableModule, MatCardModule, MatPaginatorModule],
  templateUrl: './user-show.component.html',
  styleUrl: './user-show.component.css',
})
export default class UserShowComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  user!: User;
  loading = false;

  displayedColumns: string[] = ['name', 'status'];
  dataSource = new MatTableDataSource<Task>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: UserData,
    private alertService: AlertService,
  ) {
    //console.log(data.id);
  }

  ngOnInit(): void {
    this.loadUserTasks();
    this.loadUser();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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
            //console.log(this.user);
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

  loadUserTasks(): void {
    this.userService.getUserTasks(this.data.id).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        //console.log('Tasks fetched successfully:', this.dataSource.data);
      },
      error: (error) => {
        console.error('Error fetching tasks:', error);
      },
    });
  }

  //logica del paginador
  length = 50;
  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];

  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;

  pageEvent!: PageEvent;

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput
        .split(',')
        .map((str) => +str);
    }
  }
}
