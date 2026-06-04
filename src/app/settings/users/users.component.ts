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
import { UserService, User, CreateUserDto, UpdateUserDto } from '../../core/services/user.service';
import { DecodedToken } from '../../core/models/auth.model';

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
  
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'actions'];
  
  userForm: FormGroup;
  isEditing = false;
  editingUserId: number | null = null;
  showDialog = signal(false);
  showPasswordDialog = signal(false);
  passwordForm: FormGroup;
  
  roles = AVAILABLE_ROLES;
  allPermissions = PERMISSIONS;
  
  currentUser: DecodedToken | null = null;

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.users();
    return this.users().filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.roleName.toLowerCase().includes(query)
    );
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.minLength(6)],
      roleId: [2, Validators.required],
      isActive: [true]
    });
    
    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    this.isEditing = false;
    this.editingUserId = null;
    this.userForm.reset({
      name: '',
      email: '',
      password: '',
      roleId: 2,
      isActive: true
    });
    this.showDialog.set(true);
  }

  openEditDialog(user: User): void {
    this.isEditing = true;
    this.editingUserId = user.id;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      password: '',
      roleId: user.roleId,
      isActive: user.isActive
    });
    this.showDialog.set(true);
  }

  openPasswordResetDialog(user: User): void {
    this.editingUserId = user.id;
    this.passwordForm.reset({ newPassword: '' });
    this.showPasswordDialog.set(true);
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.userForm.value;
    
    if (this.isEditing && this.editingUserId) {
      const updateDto: UpdateUserDto = {
        name: formValue.name,
        roleId: formValue.roleId,
        isActive: formValue.isActive
      };
      
      this.userService.updateUser(this.editingUserId, updateDto).subscribe({
        next: () => {
          this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
          this.loading.set(false);
          this.showDialog.set(false);
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.snackBar.open('Failed to update user', 'Close', { duration: 3000 });
          this.loading.set(false);
        }
      });
    } else {
      const createDto: CreateUserDto = {
        name: formValue.name,
        email: formValue.email,
        password: formValue.password,
        roleId: formValue.roleId
      };
      
      this.userService.createUser(createDto).subscribe({
        next: () => {
          this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
          this.loading.set(false);
          this.showDialog.set(false);
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.snackBar.open('Failed to create user', 'Close', { duration: 3000 });
          this.loading.set(false);
        }
      });
    }
  }

  resetPassword(): void {
    if (this.passwordForm.invalid || !this.editingUserId) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const newPassword = this.passwordForm.value.newPassword;
    
    this.userService.resetPassword(this.editingUserId, newPassword).subscribe({
      next: () => {
        this.snackBar.open('Password reset successfully', 'Close', { duration: 3000 });
        this.loading.set(false);
        this.showPasswordDialog.set(false);
      },
      error: (error) => {
        console.error('Error resetting password:', error);
        this.snackBar.open('Failed to reset password', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  toggleUserStatus(user: User): void {
    this.loading.set(true);
    
    this.userService.updateUser(user.id, { isActive: !user.isActive }).subscribe({
      next: () => {
        this.snackBar.open(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`, 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        this.snackBar.open('Failed to update user status', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }

    this.loading.set(true);
    
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
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
