import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list';
import { ProductCreateComponent } from './product-create/product-create';

const routes: Routes = [
  { path: '', component: ProductListComponent },             // URL: /products
  { path: 'create', component: ProductCreateComponent },     // URL: /products/create
  { path: 'edit/:id', component: ProductCreateComponent }    // URL: /products/edit/5
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }