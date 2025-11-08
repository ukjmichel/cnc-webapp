import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take, filter, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthFacade } from './auth.facade';
import * as AuthSelectors from './auth.selectors';
import * as AuthActions from './auth.actions';

/**
 * Auth Guard with token validation
 *
 * DEVELOPMENT MODE: Set ENABLE_AUTH_GUARD = true to enable authentication
 *
 * Logic when enabled:
 * 1. Check if user is logged in from cached state
 * 2. If logged in, verify token is still valid via /api/users/me request
 * 3. If token valid, allow access
 * 4. If token invalid or user not logged in, redirect to login
 */

// Toggle this to enable/disable authentication during development
const ENABLE_AUTH_GUARD = false;

export const authGuard = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);
  const store = inject(Store);

  // DEVELOPMENT: Skip auth check
  if (!ENABLE_AUTH_GUARD) {
    console.log('[Auth Guard] DEVELOPMENT MODE - Auth disabled, allowing access');
    return true;
  }

  // Check cached state first
  const isLogged = authFacade.isLogged();

  if (!isLogged) {
    // No cached login, redirect immediately
    console.log('[Auth Guard] No cached login, redirecting to /auth/login');
    return router.createUrlTree(['/auth/login']);
  }

  // User appears logged in from cache, verify token is still valid
  console.log('[Auth Guard] Cached login found, validating token via /api/users/me...');

  // Dispatch getUser action to verify token
  store.dispatch(AuthActions.getUser());

  // Listen for the result - wait for loading to finish
  return store.select(AuthSelectors.selectAuthState).pipe(
    // Wait until loading is false (effect completed)
    filter(state => !state.loading),
    take(1),
    map(state => {
      if (state.isLogged && state.user) {
        // Token is valid, user verified
        console.log('[Auth Guard] Token valid, allowing access');
        return true;
      }

      // Token invalid or user fetch failed
      console.log('[Auth Guard] Token invalid or fetch failed, redirecting to /auth/login');
      return router.createUrlTree(['/auth/login']);
    }),
    // Add timeout to prevent hanging
    timeout(5000),
    catchError((error) => {
      console.error('[Auth Guard] Error during token validation:', error);
      return of(router.createUrlTree(['/auth/login']));
    })
  );
};
