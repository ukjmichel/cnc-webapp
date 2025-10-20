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
    canActivate: [authGuard], // Protect all tabs with auth guard
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/authentication/authentication-routing.module').then(
        (m) => m.AuthenticationRoutingModule
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
