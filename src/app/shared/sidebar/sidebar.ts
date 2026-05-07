// import { Component, OnInit, signal, Input, Output, EventEmitter } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterModule } from '@angular/router';
// import { AuthService } from '../../core/services/auth.service';

// @Component({
//   selector: 'app-sidebar',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './sidebar.html',
//   styleUrl: './sidebar.scss'
// })
// export class SidebarComponent implements OnInit {
//   @Input() isOpen = false;
//   @Output() closeSidebar = new EventEmitter<void>();
  
//   // Signals to hold our UI data
//   userName = signal('');
//   userRole = signal('');
//   companyName = signal('TaxAccount'); // Default fallback
//   currentPath = signal('');

//   navItems = [
//     { path: '/dashboard', icon: '📊', label: 'Dashboard' },
//     { path: '/invoices', icon: '🧾', label: 'Invoices' },
//   ];

//   constructor(
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     // This grabs the DecodedToken from our updated AuthService
//     const user = this.authService.getCurrentUser();
    
//     if (user) {
//       // Map the JWT claims to our UI signals
//       this.companyName.set(user.CompanyName || 'TaxAccount');
      
//       // Tokens usually rely on email instead of full name for identity
//       this.userName.set(user.email || 'User'); 
//       this.userRole.set(user.role || 'Admin');
//     }
    
//     this.currentPath.set(this.router.url);
//   }

//   isActive(path: string): boolean {
//     return this.router.url.startsWith(path);
//   }

//   navigateTo(path: string): void {
//     this.router.navigate([path]);
//     this.closeSidebar.emit();
//   }

//   logout(): void {
//     this.authService.logout();
//     this.closeSidebar.emit();
//     this.router.navigate(['/auth/login']);
//   }
// }
import { Component, OnInit, signal, Input, Output, EventEmitter, inject } from '@angular/core';
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
// Mobile drawer state (from your old code)
  @Input() isOpen = false; 
  @Output() closeSidebar = new EventEmitter<void>(); 

  // Desktop collapse state (from the new Zoho UI)
  isCollapsed = signal(false);

  // Dynamic UI Signals
  userName = signal('');
  userRole = signal('');
  companyName = signal('TaxAccount'); // Default fallback

   menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: '📊' },
    { title: 'Sales Invoices', path: '/invoices', icon: '🧾' },
    //{ title: 'Purchase Bills', path: '/purchases', icon: '🛒' },
    { title: 'Purchase Bills',path: '/purchase', icon: '🛒' },
    { title: 'Products', path: '/products', icon: '📦' },
    { title: 'Contacts', path: '/contacts', icon: '👥' },
    { title: 'Stock Adjustment', path: '/stock', icon: '⚖️' },
    //{ title: 'Purchase Bills',path: '/purchase', icon: '🛒', permission: 'invoices.view' },
    { title: 'Company Settings', path: '/settings/profile', icon: '⚙️' }
  ];

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    // Grab the DecodedToken from your updated AuthService
    const user = this.authService.getCurrentUser();
    
    if (user) {
      // Map the JWT claims to the UI signals
      this.companyName.set(user.CompanyName || 'TaxAccount');
      this.userName.set(user.email || 'User'); 
      this.userRole.set(user.role || 'Admin');
    }
  }

  // Toggles the shrink/expand on Desktop
  toggleSidebar(): void {
    this.isCollapsed.set(!this.isCollapsed());
  }

  // Called when a user clicks a link (useful for closing mobile drawer)
  onItemClick(): void {
    this.closeSidebar.emit();
  }

  // Fully working logout logic
  onLogout(): void {
    this.authService.logout();
    this.closeSidebar.emit();
    this.router.navigate(['/auth/login']);
  }

    logout(): void {
    this.authService.logout();
    this.closeSidebar.emit();
    this.router.navigate(['/auth/login']);
  }
}