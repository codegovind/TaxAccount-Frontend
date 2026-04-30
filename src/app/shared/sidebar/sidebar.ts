import { Component, OnInit, signal, Input, Output, EventEmitter } from '@angular/core';
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
  @Output() closeSidebar = new EventEmitter<void>();
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
    this.closeSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
    this.closeSidebar.emit();
    this.router.navigate(['/auth/login']);
  }
}