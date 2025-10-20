import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';


// Key for feature module
export const AUTH_FEATURE_KEY = 'auth';

// Main feature selector
export const selectAuthState =
  createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);

// Selectors for each property
export const selectIsLogged = createSelector(
  selectAuthState,
  (state) => state.isLogged
);

export const selectAuthRole = createSelector(
  selectAuthState,
  (state) => state.role
);

export const selectAuthUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);
