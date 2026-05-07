import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseListComponent } from './purchase-list/purchase-list';
import { PurchaseCreateComponent } from './purchase-create/purchase-create';
import { PurchaseDetailComponent  } from './purchase-detail/purchase-detail';
import { OrderListComponent  } from './order-list/order-list';
import { OrderCreateComponent  } from './order-create/order-create';

const routes: Routes = [
  { path: '', component: PurchaseListComponent },
  { path: 'create', component: PurchaseCreateComponent },
  { path: 'orders', component: OrderListComponent },
  { path: 'orders/create', component: OrderCreateComponent },
  { path: ':id', component: PurchaseDetailComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    PurchaseListComponent,
    PurchaseCreateComponent,
    PurchaseDetailComponent,
    OrderListComponent,
    OrderCreateComponent
  ]
})
export class PurchaseModule {}