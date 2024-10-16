import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { tap } from 'rxjs';

import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { SelectionModel } from '@angular/cdk/collections';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import UserCreateComponent from '../user-create/user-create.component';
import UserEditComponent from '../user-edit/user-edit.component';
import { MatIconModule } from '@angular/material/icon';
import TaskCreateComponent from '../../../tasks/pages/task-create/task-create.component';
import { SharedService } from '../../../shared/services/shared.service';
import { AlertService } from '../../../shared/services/alert.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import UserShowComponent from '../user-show/user-show.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-user-list',
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
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export default class UserListComponent implements OnInit, AfterViewInit {
  users: User[] = [];
  loading = false;
  searchTerm: string = '';
 
  displayedColumns: string[] = ['select', 'name', 'role', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  selection = new SelectionModel<User>(true, []);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private userService: UserService,
    public dialog: MatDialog,
    private sharedService: SharedService,
    private alertService: AlertService,
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
    this.userService
      .getAllUsers()
      .pipe(
        tap((response: ApiResponse) => {
          this.users = response.data;
          this.dataSource.data = response.data;
          //console.log('Fetched users:', this.users);
        }),
      )
      .subscribe({
        next: () => {
          //console.log('Data loaded successfully');
          this.loading = true;
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
          console.error('Error fetching users:', error);
        },
        complete: () => {
          //console.log('Request completed');
        },
      });
  }

  onDelete(userId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            //console.log('User deleted:', response);
            this.onLoad();
            this.alertService.showSuccess(
              'User deleted successfully',
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
    this.dataSource.data = this.users.filter((user) => {
      return user.name.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.onLoad();
  }

  // logica de los dialog de material
  createUser() {
    const dialogRef = this.dialog.open(UserCreateComponent, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(() => {
      //console.log(`Dialog result: ${result}`);
    });
  }

  editUser(userId: number | undefined) {
    const dialogRef = this.dialog.open(UserEditComponent, {
      data: { id: userId },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(() => {
      //console.log(`Dialog result: ${result}`);
    });
  }

  showUser(userId: number | undefined) {
    const dialogRef = this.dialog.open(UserShowComponent, {
      width: '80%',
      data: { id: userId },
    });

    dialogRef.afterClosed().subscribe(() => {
      //console.log(`Dialog result: ${result}`);
    });
  }

  createTask(userId: number | undefined) {
    const dialogRef = this.dialog.open(TaskCreateComponent, {
      width: '60%',
      data: { id: userId },
      disableClose: true,
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
  checkboxLabel(row?: User): string {
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
