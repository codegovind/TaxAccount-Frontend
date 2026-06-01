import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/services/auth.service';
import { DecodedToken } from '../../core/models/auth.model';

interface User {
  id: number;
  tenantId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  roleId: number;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

const AVAILABLE_ROLES: Role[] = [
  { id: 1, name: 'Owner', description: 'Full access to all features' },
  { id: 2, name: 'Manager', description: 'Manage operations, cannot delete tenant' },
  { id: 3, name: 'Staff', description: 'Limited access to daily operations' },
  { id: 4, name: 'Auditor', description: 'Read-only access to reports' }
];

const PERMISSIONS = [
  'products.view', 'products.create', 'products.edit', 'products.delete',
  'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete',
  'reports.view',
  'users.manage',
  'accounts.manage',
  'contacts.manage',
  'stock.manage'
];

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'role', 'status', 'actions'];
  
  userForm: FormGroup;
  isEditing = false;
  editingUserId: number | null = null;
  showDialog = signal(false);
  
  roles = AVAILABLE_ROLES;
  allPermissions = PERMISSIONS;
  
  currentUser: DecodedToken | null = null;

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.users();
    return this.users().filter(user => 
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      roleId: [2, Validators.required],
      permissions: [[]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    
    // TODO: Replace with actual API call to /api/users
    // For now, using mock data
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: 1,
          tenantId: this.currentUser?.TenantId ? parseInt(this.currentUser.TenantId) : 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@company.com',
          role: 'Owner',
          roleId: 1,
          permissions: PERMISSIONS,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          tenantId: this.currentUser?.TenantId ? parseInt(this.currentUser.TenantId) : 1,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@company.com',
          role: 'Manager',
          roleId: 2,
          permissions: ['products.view', 'invoices.view', 'reports.view'],
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
      this.users.set(mockUsers);
      this.loading.set(false);
    }, 500);
  }

  openCreateDialog(): void {
    this.isEditing = false;
    this.editingUserId = null;
    this.userForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      roleId: 2,
      permissions: [],
      isActive: true
    });
    this.showDialog.set(true);
  }

  openEditDialog(user: User): void {
    this.isEditing = true;
    this.editingUserId = user.id;
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleId: user.roleId,
      permissions: user.permissions,
      isActive: user.isActive
    });
    this.showDialog.set(true);
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.userForm.value;
    
    // TODO: Replace with actual API call
    // POST /api/users for create, PUT /api/users/{id} for update
    setTimeout(() => {
      if (this.isEditing && this.editingUserId) {
        // Update existing user
        const updatedUsers = this.users().map(u => 
          u.id === this.editingUserId 
            ? { ...u, ...formValue, role: this.roles.find(r => r.id === formValue.roleId)?.name || 'Unknown' }
            : u
        );
        this.users.set(updatedUsers);
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
      } else {
        // Create new user
        const newUser: User = {
          id: this.users().length + 1,
          tenantId: this.currentUser?.TenantId ? parseInt(this.currentUser.TenantId) : 1,
          ...formValue,
          role: this.roles.find(r => r.id === formValue.roleId)?.name || 'Unknown',
          createdAt: new Date().toISOString()
        };
        this.users.set([...this.users(), newUser]);
        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
      }
      
      this.loading.set(false);
      this.showDialog.set(false);
    }, 500);
  }

  toggleUserStatus(user: User): void {
    this.loading.set(true);
    
    // TODO: Replace with actual API call PATCH /api/users/{id}/status
    setTimeout(() => {
      const updatedUsers = this.users().map(u => 
        u.id === user.id ? { ...u, isActive: !u.isActive } : u
      );
      this.users.set(updatedUsers);
      this.snackBar.open(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`, 'Close', { duration: 3000 });
      this.loading.set(false);
    }, 300);
  }

  deleteUser(user: User): void {
    if (!confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    this.loading.set(true);
    
    // TODO: Replace with actual API call DELETE /api/users/{id}
    setTimeout(() => {
      const updatedUsers = this.users().filter(u => u.id !== user.id);
      this.users.set(updatedUsers);
      this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
      this.loading.set(false);
    }, 300);
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'Owner': return 'primary';
      case 'Manager': return 'accent';
      case 'Staff': return 'warn';
      default: return '';
    }
  }

  canManageUsers(): boolean {
    return this.currentUser?.role === 'Owner' || this.authService.hasPermission('users.manage');
  }
}
