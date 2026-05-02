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

  constructor(
    private homeService: HomeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName.set(user?.email || '');
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

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getStatusClass(statusEnum: number): string {
    switch (statusEnum) {
      case 3: return 'status-paid';
      case 2: return 'status-sent';
      case 1: return 'status-draft';
      case 4: return 'status-cancelled';
      default: return '';
    }
  }

  getStatusText(statusEnum: number): string {
    switch (statusEnum) {
      case 3: return 'Paid';
      case 2: return 'Sent';
      case 1: return 'Draft';
      case 4: return 'Cancelled';
      default: return 'Unknown';
    }
  }
}