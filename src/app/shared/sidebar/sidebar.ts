import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = false;
  userName = signal('');
  userRole = signal('');
  currentPath = signal('');

  navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/invoices', icon: '🧾', label: 'Invoices' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName.set(user?.fullName || '');
    this.userRole.set(user?.role || '');
    this.currentPath.set(this.router.url);
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}