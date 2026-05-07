import { NgModule } from '@angular/core';
//import { RouterModule, Routes } from '@angular/router';
import { AuthRoutingModule } from './auth-routing-module';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';

// const routes: Routes = [
//   { path: 'login', component: LoginComponent },
//   { path: 'register', component: RegisterComponent },
//   { path: '', redirectTo: 'login', pathMatch: 'full' }
// ];

@NgModule({
  imports: [
    // RouterModule.forChild(routes),
    AuthRoutingModule,
    LoginComponent,
    RegisterComponent
  ]
})
export class AuthModule {}