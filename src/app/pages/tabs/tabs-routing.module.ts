import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('../home/home-routing.module').then(
            (m) => m.HomePageRoutingModule
          ),
      },
      {
        path: 'shopping-list',
        loadChildren: () =>
          import('../shopping-list/shopping-list-routing.module').then(
            (m) => m.ShoppingListPageRoutingModule
          ),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('../products/products-routing.module').then(
            (m) => m.ProductsPageRoutingModule
          ),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home', // Changed from /tabs/tab1
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule], // Added exports
})
export class TabsPageRoutingModule {}
