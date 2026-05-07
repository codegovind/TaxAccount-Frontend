// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { SidebarComponent } from '../sidebar/sidebar';

// @Component({
//   selector: 'app-layout',
//   standalone: true,
//   imports: [CommonModule, RouterModule, SidebarComponent],
//   templateUrl: './layout.html',
//   styleUrl: './layout.scss'
// })
// export class LayoutComponent {
//   sidebarOpen = false;

//   toggleSidebar(): void {
//     this.sidebarOpen = !this.sidebarOpen;
//   }
// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class AppLayoutComponent {
  // Holds the state for the mobile drawer
  isMobileSidebarOpen = false;

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }
}