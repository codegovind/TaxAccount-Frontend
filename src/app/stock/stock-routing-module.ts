import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockListComponent } from './stock-list/stock-list';
import { StockAdjustComponent } from './stock-adjust/stock-adjust';

const routes: Routes = [
  { path: '', component: StockListComponent },
  { path: 'adjust', component: StockAdjustComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockRoutingModule { }