// auth.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of, concat } from 'rxjs';
import {
  catchError,
  exhaustMap,
  map,
  switchMap,
  tap,
  concatMap,
} from 'rxjs/operators';

import * as AuthActions from './auth.actions';
import { environment } from 'src/environments/environment';
import { LoginResponse, User } from 'src/app/models/auth.model';
import { ApiEnvelope } from 'src/app/models/api.model';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private router = inject(Router);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Login
   * API: ApiEnvelope<{ user: User }>
   */
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      tap((action) => console.log('[Login Effect] Triggered:', action)),
      exhaustMap(({ email, password }) =>
        this.http
          .post<ApiEnvelope<{ user: User }>>(
            `${this.apiUrl}api/auth/login`,
            { identifier: email, password }, 
            { withCredentials: true }
          )
          .pipe(
            tap((res) => console.log('[Login Effect] Success:', res)),
            map((res) =>
              AuthActions.loginSuccess({
                message: res.message,
                data: res.data, // { user }
              })
            ),
            catchError((error) => {
              console.log('[Login Effect] Error:', error);
              return of(
                AuthActions.loginFailure({
                  error:
                    error?.error?.message || error?.message || 'Login failed',
                })
              );
            })
          )
      )
    )
  );

  /**
   * Register then login
   * Register API: ApiEnvelope<User>
   * Login API: ApiEnvelope<{ user: User }>
   */
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      tap((action) => console.log('[Register Effect] Triggered:', action)),
      exhaustMap(({ email, username, password, firstName, lastName }) =>
        this.http
          .post<ApiEnvelope<User>>(
            `${this.apiUrl}api/auth/register`,
            { email, username, password, firstName, lastName },
            { withCredentials: true }
          )
          .pipe(
            tap((res) => console.log('[Register Effect] Success:', res)),
            // 1) emit registerSuccess
            // 2) call /auth/login and emit loginSuccess (so isLogged = true)
            concatMap((res) => {
              const registerPayload: LoginResponse = {
                message: res.message,
                data: { user: res.data },
              };
              const registerAction =
                AuthActions.registerSuccess(registerPayload);

              console.log(
                '[Register Effect] Dispatching registerSuccess, calling auto-login'
              );

              const login$ = this.http
                .post<ApiEnvelope<{ user: User }>>(
                  `${this.apiUrl}api/auth/login`,
                  { identifier: email, password }, // Changed from emailOrUsername to identifier
                  { withCredentials: true }
                )
                .pipe(
                  tap((loginRes) =>
                    console.log(
                      '[Register Effect] Auto-login success:',
                      loginRes
                    )
                  ),
                  map((loginRes) =>
                    AuthActions.loginSuccess({
                      message: loginRes.message,
                      data: loginRes.data, // { user }
                    })
                  ),
                  catchError((err) => {
                    console.log('[Register Effect] Auto-login error:', err);
                    return of(
                      AuthActions.loginFailure({
                        error:
                          err?.error?.message ??
                          err?.message ??
                          'Login failed after registration',
                      })
                    );
                  })
                );

              return concat(of(registerAction), login$);
            }),
            catchError((err) => {
              console.log('[Register Effect] Error:', err);
              return of(
                AuthActions.registerFailure({
                  error:
                    err?.error?.message ??
                    err?.message ??
                    'Registration failed',
                })
              );
            })
          )
      )
    )
  );

  /**
   * Load current user (session check)
   * API: ApiEnvelope<{ user: User }>
   */
  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.getUser),
      tap((action) => console.log('[GetUser Effect] Triggered:', action)),
      switchMap(() =>
        this.http
          .get<ApiEnvelope<{ user: User }>>(`${this.apiUrl}api/users/me`, {
            withCredentials: true,
          })
          .pipe(
            tap((res) => console.log('[GetUser Effect] Success:', res)),
            map((res) =>
              AuthActions.getUserSuccess({
                message: res.message,
                data: { user: res.data.user },
              })
            ),
            catchError((error) => {
              console.log('[GetUser Effect] Error:', error);
              if (error?.status === 401) {
                console.log(
                  '[GetUser Effect] 401 detected, dispatching refreshToken'
                );
                return of(AuthActions.refreshToken());
              }
              return of(
                AuthActions.getUserFailure({
                  error: 'Failed to fetch user data',
                })
              );
            })
          )
      )
    )
  );

  /**
   * Refresh token
   */
  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      tap((action) => console.log('[RefreshToken Effect] Triggered:', action)),
      switchMap(() =>
        this.http
          .post(`${this.apiUrl}api/auth/refresh`, {}, { withCredentials: true })
          .pipe(
            tap((res) => console.log('[RefreshToken Effect] Success:', res)),
            map(() => AuthActions.getUser()),
            catchError((err) => {
              console.log('[RefreshToken Effect] Error:', err);
              return of(AuthActions.refreshTokenFailure());
            })
          )
      )
    )
  );

  /**
   * Redirect after successful auth
   * (listen only to loginSuccess to avoid double navigation)
   */
  redirectAfterAuth$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap((action) => {
          console.log('[RedirectAfterAuth Effect] Triggered:', action);
          const returnUrl =
            this.router.routerState.snapshot.root.queryParamMap.get(
              'returnUrl'
            ) || '/tabs/home';
          console.log('[RedirectAfterAuth Effect] Navigating to:', returnUrl);
          this.router.navigateByUrl(returnUrl);
        })
      ),
    { dispatch: false }
  );

  /**
   * Logout
   */
  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap((action) => console.log('[Logout Effect] Triggered:', action)),
        exhaustMap(() =>
          this.http
            .post(
              `${this.apiUrl}api/auth/logout`,
              {},
              { withCredentials: true }
            )
            .pipe(
              tap(() => {
                console.log('[Logout Effect] Success, navigating to login');
                this.router.navigate(['/auth/login']);
              }),
              catchError((err) => {
                console.log('[Logout Effect] Error:', err);
                this.router.navigate(['/auth/login']);
                return of();
              })
            )
        )
      ),
    { dispatch: false }
  );
}
