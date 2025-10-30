import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewShoppingListPage } from './new-shopping-list.page';

const routes: Routes = [
  {
    path: '',
    component: NewShoppingListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewShoppingListPageRoutingModule {}
