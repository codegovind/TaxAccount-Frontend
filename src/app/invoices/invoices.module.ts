import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceListComponent } from './invoice-list/invoice-list';
import { InvoiceCreateComponent } from './invoice-create/invoice-create';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail';

const routes: Routes = [
  { path: '', component: InvoiceListComponent },
  { path: 'create', component: InvoiceCreateComponent },
  { path: ':id', component: InvoiceDetailComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    InvoiceListComponent,
    //InvoiceCreateComponent,
    //InvoiceDetailComponent
  ]
})
export class InvoicesModule {}