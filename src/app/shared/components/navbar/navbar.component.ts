import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../admin/interfaces/user.interface';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { AlertService } from '../../services/alert.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatMenuModule, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  public user: User | null = null;
  completedTaskCount: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService,
    private sharedService: SharedService,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    //console.log(this.user);
    this.user = this.authService.getUser();
    if (this.user && typeof this.user.id === 'number') {
      this.completedTaskCount = this.sharedService.getCompletedTasksForUser(
        this.user.id,
      );
    } else {
      this.completedTaskCount = 0;
    }

    // Suscribirse a los cambios y actualizar el contador cuando se complete una tarea
    this.sharedService.completedTask$.subscribe(() => {
      if (this.user && typeof this.user.id === 'number') {
        this.completedTaskCount = this.sharedService.getCompletedTasksForUser(
          this.user.id,
        );
      }
    });
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
    this.alertService.showSuccess(`Come back soon!`, 'Success');
  }
}
