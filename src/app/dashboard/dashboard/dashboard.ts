import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HomeService, DashboardData } from '../../core/services/home.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  dashboardData = signal<DashboardData | null>(null);
  isLoading = signal(true);
  userName = signal('');
  //userRole = signal('');

  constructor(
    private homeService: HomeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName.set(user?.fullName || '');
    //this.userRole.set(user?.role || '');
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.homeService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log('Error:', err);
        this.isLoading.set(false);
      }
    });
  }

  // logout(): void {
  //   this.authService.logout();
  //   this.router.navigate(['/auth/login']);
  // }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid': return 'status-paid';
      case 'sent': return 'status-sent';
      case 'draft': return 'status-draft';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
}