import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login'; 
import { RegisterComponent } from './register/register';

const routes: Routes = [
  // 1. If they just type /auth, automatically send them to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // 2. The actual routes that load your components
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
