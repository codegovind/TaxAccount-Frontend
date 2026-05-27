import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [RouterLink],
  template: `<div class="p-4"><h2 class="text-2xl font-bold mb-4">Company Settings</h2><p>Company settings form coming soon...</p></div>`,
  styles: []
})
export class CompanySettingsComponent {}
