import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShoppingListDetailPage } from './shopping-list-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ShoppingListDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShoppingListDetailPageRoutingModule {}
