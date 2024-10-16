import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

import { Task } from '../../interfaces/task.interface';

import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../services/task.service';
import { SharedService } from '../../../shared/services/shared.service';
import { AlertService } from '../../../shared/services/alert.service';
import { tap } from 'rxjs';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import TaskEditComponent from '../task-edit/task-edit.component';
import TaskShowComponent from '../task-show/task-show.component';
import { AuthService } from '../../../auth/services/auth.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatCardModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatButtonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    LoaderComponent,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
})
export default class TaskListComponent implements OnInit, AfterViewInit {
  loading = false;
  searchTerm: string = '';

  displayedColumns: string[] = ['select', 'name', 'status', 'actions'];
  dataSource = new MatTableDataSource<Task>([]);
  selection = new SelectionModel<Task>(true, []);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private taskService: TaskService,
    public dialog: MatDialog,
    private sharedService: SharedService,
    private alertService: AlertService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.onLoad();
    this.sharedService.elementCreated$.subscribe(() => {
      this.onLoad();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onLoad(): void {
    const user = this.authService.getUser();
    //console.log(user);

    this.taskService
      .getAllTasks()
      .pipe(
        tap((response: ApiResponse) => {
          //console.log('Response Data:', response.data);
          if (this.authService.isAdmin()) {
            this.dataSource.data = response.data;
          } else if (this.authService.isUser()) {
            this.dataSource.data = response.data.filter(
              (task) => task.user.id === user!.id && task.status !== 'complete',
            );
          }

          //console.log('Fetched tasks:', this.dataSource.data);
        }),
      )
      .subscribe({
        next: () => {
          this.loading = true;
          //console.log('Data loaded successfully');
        },
        error: (error) => {
          switch (error.status) {
            case 401:
              this.alertService.showError(
                'You are not authorized. Please log in.',
                'Error 401',
              );
              break;
            case 403:
              this.alertService.showError(
                'Access denied. You do not have the required permissions.',
                'Error 403',
              );
              break;
            case 500:
              this.alertService.showError(
                'Server error. Please try again later.',
                'Error 500',
              );
              break;
            default:
              this.alertService.showError(
                'An unknown error occurred. Please try again.',
                'Error',
              );
              break;
          }
          console.error('Error fetching tasks:', error);
        },
        complete: () => {
          //console.log('Request completed');
        },
      });
  }

  onDelete(taskId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.taskService.deleteTask(taskId).subscribe({
          next: () => {
            //console.log('Task deleted:', response);
            this.onLoad();
            this.alertService.showSuccess(
              'Task deleted successfully',
              'Success',
            );
          },
          error: (error) => {
            switch (error.status) {
              case 401:
                this.alertService.showError(
                  'You are not authorized. Please log in.',
                  'Error 401',
                );
                break;
              case 403:
                this.alertService.showError(
                  'Access denied. You do not have the required permissions.',
                  'Error 403',
                );
                break;
              case 500:
                this.alertService.showError(
                  'Server error. Please try again later.',
                  'Error 500',
                );
                break;
              default:
                this.alertService.showError(
                  'An unknown error occurred. Please try again.',
                  'Error',
                );
                break;
            }
            console.error('Error deleting user:', error);
          },
        });
      } else {
        this.alertService.showInfo('User deletion canceled', 'Canceled');
      }
    });
  }

  //  logica para el buscador
  filterData() {
    this.dataSource.data = this.dataSource.data.filter((task) => {
      return (
        task.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.status.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.user?.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.onLoad();
  }

  // logica de los dialog de material
  editTask(userId: number | undefined) {
    const dialogRef = this.dialog.open(TaskEditComponent, {
      width: '60%',
      data: { id: userId },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(() => {
      //console.log(`Dialog result: ${result}`);
    });
  }

  showTask(userId: number | undefined) {
    const dialogRef = this.dialog.open(TaskShowComponent, {
      width: '80%',
      data: { id: userId },
    });

    dialogRef.afterClosed().subscribe(() => {
      //console.log(`Dialog result: ${result}`);
    });
  }

  // logica de la tabla de material
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Task): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.name + 1}`;
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
