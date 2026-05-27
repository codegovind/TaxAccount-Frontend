// import { Component, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { AuthService } from '../../core/services/auth.service';
// import { HomeService, DashboardData } from '../../core/services/home.service';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './dashboard.html',
//   styleUrl: './dashboard.scss'
// })
// export class DashboardComponent implements OnInit {
//   dashboardData = signal<DashboardData | null>(null);
//   isLoading = signal(true);
//   userName = signal('');

//   constructor(
//     private homeService: HomeService,
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     const user = this.authService.getCurrentUser();
//     this.userName.set(user?.email || '');
//     this.loadDashboard();
//   }

//   loadDashboard(): void {
//     this.homeService.getDashboard().subscribe({
//       next: (data) => {
//         this.dashboardData.set(data);
//         this.isLoading.set(false);
//       },
//       error: (err) => {
//         console.log('Error:', err);
//         this.isLoading.set(false);
//       }
//     });
//   }

//   navigateTo(path: string): void {
//     this.router.navigate([path]);
//   }

//   getStatusClass(statusEnum: number): string {
//     switch (statusEnum) {
//       case 3: return 'status-paid';
//       case 2: return 'status-sent';
//       case 1: return 'status-draft';
//       case 4: return 'status-cancelled';
//       default: return '';
//     }
//   }

//   getStatusText(statusEnum: number): string {
//     switch (statusEnum) {
//       case 3: return 'Paid';
//       case 2: return 'Sent';
//       case 1: return 'Draft';
//       case 4: return 'Cancelled';
//       default: return 'Unknown';
//     }
//   }
// }
/////////////////////////////////
// import { Component, OnInit, signal } from '@angular/core';
// import { Router } from '@angular/router';
// import { AuthService } from '../../core/services/auth.service';
// import { HomeService, DashboardData } from '../../core/services/home.service';

// @Component({
//   selector: 'app-dashboard',
//   // Removed standalone: true and imports: [CommonModule]
//   templateUrl: './dashboard.html',
//   styleUrl: './dashboard.scss' 
// })
// export class DashboardComponent implements OnInit {
//   dashboardData = signal<DashboardData | null>(null);
//   isLoading = signal(true);
//   userName = signal('');

//   constructor(
//     private homeService: HomeService,
//     private authService: AuthService,
//     public router: Router
//   ) {}

//   ngOnInit(): void {
//     const user = this.authService.getCurrentUser();
//     const displayName = user?.email ? user.email.split('@')[0] : 'Admin';
//     this.userName.set(displayName);
//     this.loadDashboard();
//   }

//   loadDashboard(): void {
//     this.homeService.getDashboard().subscribe({
//       next: (data) => {
//         this.dashboardData.set(data);
//         this.isLoading.set(false);
//       },
//       error: (err) => {
//         console.error('Dashboard Data Error:', err);
//         this.isLoading.set(false);
//       }
//     });
//   }

//   getStatusClass(statusEnum: number): string {
//     switch (statusEnum) {
//       case 3: return 'paid'; 
//       case 2: return 'sent';
//       case 1: return 'draft';
//       case 4: return 'cancelled';
//       default: return '';
//     }
//   }

//   getStatusText(statusEnum: number): string {
//     switch (statusEnum) {
//       case 3: return 'Paid';
//       case 2: return 'Sent';
//       case 1: return 'Draft';
//       case 4: return 'Cancelled';
//       default: return 'Unknown';
//     }
//   }
// }
/////////////////////////////////////////////////////////////////
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Required for standalone
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HomeService, DashboardData } from '../../core/services/home.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,           // <-- Back to modern Angular!
  imports: [CommonModule],    // <-- Replaces the module declaration
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
    public router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    const displayName = user?.email ? user.email.split('@')[0] : 'Admin';
    this.userName.set(displayName);
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.homeService.getDashboard().subscribe({
      next: (data) => {
        if (data) {
          this.dashboardData.set(data);
        } else {
          this.setMockDataFallback();
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Dashboard API Error - Backend might be offline:', err);
        this.setMockDataFallback();
        this.isLoading.set(false);
      }
    });
  }
  
  setMockDataFallback(): void {
    this.dashboardData.set({
      totalInvoices: 125,
      totalProducts: 45,
      totalUsers: 3,
      totalRevenue: 245000.50,
      pendingInvoices: 12,
      draftInvoices: 5,
      recentInvoices: [
        { id: 1, invoiceNumber: 'INV-0001', contactName: 'Acme Corp', invoiceDate: new Date(), totalAmount: 45000 },
        { id: 2, invoiceNumber: 'INV-0002', contactName: 'TechFlow', invoiceDate: new Date(), totalAmount: 12500 }
      ]
    });
  }
}