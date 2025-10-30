import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './store/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/tabs/tabs-routing.module').then(
        (m) => m.TabsPageRoutingModule
      ),
    //canActivate: [authGuard], // Protect all tabs with auth guard
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/authentication/authentication-routing.module').then(
        (m) => m.AuthenticationRoutingModule
      ),
  },
  {
    path: 'shopping-list',
    loadChildren: () =>
      import('./pages/shopping-list/shopping-list-routing.module').then(
        (m) => m.ShoppingListPageRoutingModule
      ),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./pages/products/products-routing.module').then(
        (m) => m.ProductsPageRoutingModule
      ),
  },
  {
    path: 'new-product',
    loadChildren: () =>
      import('./pages/new-product/new-product-routing.module').then(
        (m) => m.NewProductPageRoutingModule
      ),
  },
  {
    path: 'new-shopping-list',
    loadChildren: () =>
      import('./pages/new-shopping-list/new-shopping-list-routing.module').then(
        (m) => m.NewShoppingListPageRoutingModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
