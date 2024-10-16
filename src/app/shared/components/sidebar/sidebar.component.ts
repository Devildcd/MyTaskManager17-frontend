import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

interface MenuItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.initializeMenu();
  }

  initializeMenu() {
    if (this.authService.isAdmin()) {
      this.menuItems = [
        { path: '/dashboard', icon: 'fas fa-th', label: 'Dashboard' },
        { path: '/users/list', icon: 'fas fa-user', label: 'Users' },
        { path: '/tasks', icon: 'fas fa-book', label: 'Tasks' },
      ];
    } else if (this.authService.isUser()) {
      this.menuItems = [
        { path: '/dashboard', icon: 'fas fa-th', label: 'Dashboard' },
        { path: '/tasks', icon: 'fas fa-book', label: 'Tasks' },
      ];
    }
  }
}
