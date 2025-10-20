import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import * as AuthSelectors from './auth.selectors';

/**
 * Facade for Auth state management using NgRx.
 * Signals are assigned in the constructor for easy template and component binding.
 */
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  // Signals for component binding
  isLogged;
  user;
  loading;
  error;

  constructor(private store: Store) {
    // Assign signals for each auth selector
    this.isLogged = this.store.selectSignal(AuthSelectors.selectIsLogged);
    this.user = this.store.selectSignal(AuthSelectors.selectAuthUser);
    this.loading = this.store.selectSignal(AuthSelectors.selectAuthLoading);
    this.error = this.store.selectSignal(AuthSelectors.selectAuthError);
  }

  /** Dispatch login action */
  login(email: string, password: string) {
    this.store.dispatch(AuthActions.login({ email, password }));
  }

  /** Dispatch register action */
  register(
    email: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    this.store.dispatch(
      AuthActions.register({ email, username, password, firstName, lastName })
    );
  }

  /** Dispatch logout action */
  logout() {
    this.store.dispatch(AuthActions.logout());
  }

  /** Dispatch user fetch action (silent login/session check) */
  getUser() {
    this.store.dispatch(AuthActions.getUser());
  }

  /** Clear any error messages from state */
  clearError() {
    this.store.dispatch(AuthActions.clearError());
  }
}
