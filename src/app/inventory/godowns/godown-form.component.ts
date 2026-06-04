import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InventoryService, Godown } from '../../core/services/inventory.service';

@Component({
  selector: 'app-godown-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './godown-form.component.html',
  styleUrls: ['./godown-form.component.scss']
})
export class GodownFormComponent implements OnInit {
  form: FormGroup;
  loading = signal(false);
  mode: 'create' | 'edit';
  godown?: Godown;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private dialogRef: MatDialogRef<GodownFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: { mode: 'create' | 'edit'; godown?: Godown }
  ) {
    this.mode = data.mode;
    this.godown = data.godown;
    
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.maxLength(20)]],
      address: ['', [Validators.maxLength(500)]],
      contactPerson: ['', [Validators.maxLength(100)]],
      contactNumber: ['', [Validators.pattern('^[0-9]{10}$')]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.godown) {
      this.form.patchValue({
        name: this.godown.name,
        code: this.godown.code,
        address: this.godown.address || '',
        contactPerson: this.godown.contactPerson || '',
        contactNumber: this.godown.contactNumber || '',
        isActive: this.godown.isActive
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formData = this.form.value;

    if (this.mode === 'create') {
      this.inventoryService.createGodown(formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating godown:', error);
          this.loading.set(false);
          alert('Failed to create godown');
        }
      });
    } else {
      this.inventoryService.updateGodown(this.godown!.id, formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error updating godown:', error);
          this.loading.set(false);
          alert('Failed to update godown');
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
