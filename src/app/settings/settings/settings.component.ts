import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  template: `<div class="p-4"><h2 class="text-2xl font-bold mb-4">Settings</h2><div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><a routerLink="company" class="card p-4 hover:shadow-lg cursor-pointer"><h3 class="font-bold text-lg">Company Settings</h3><p class="text-gray-600">Manage company details and GST information</p></a><a routerLink="features" class="card p-4 hover:shadow-lg cursor-pointer"><h3 class="font-bold text-lg">Feature Toggles</h3><p class="text-gray-600">Enable or disable features like E-Way Bill</p></a></div></div>`,
  styles: []
})
export class SettingsComponent {}
