// auth.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { Role, User } from 'src/app/models/auth.model';


export interface AuthState {
  isLogged: boolean;
  role: Role;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  isLogged: false,
  role: 'utilisateur',
  user: null,
  loading: false,
  error: null,
};

export const authFeatureKey = 'auth';

const reducer = createReducer(
  initialAuthState,

  // ---- Requests start
  on(AuthActions.getUser, AuthActions.login, AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  // ---- Success: ensure isLogged = true
  on(
    AuthActions.loginSuccess,
    AuthActions.registerSuccess,
    (state, { data }) => ({
      ...state,
      isLogged: true,
      user: data.user,
      role: data.user.role ?? 'utilisateur',
      loading: false,
      error: null,
    })
  ),

  on(AuthActions.getUserSuccess, (state, { data }) => ({
    ...state,
    isLogged: true,
    user: data.user,
    role: data.user.role ?? 'utilisateur',
    loading: false,
    error: null,
  })),

  // ---- Failures
  on(
    AuthActions.getUserFailure,
    AuthActions.loginFailure,
    AuthActions.registerFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
      // do NOT forcibly flip isLogged here; leave it as-is unless you want strict false:
      // isLogged: false,
    })
  ),

  // ---- Refresh token outcomes (optional state tweaks)
  on(AuthActions.refreshToken, (state) => ({ ...state, loading: true })),
  on(AuthActions.refreshTokenSuccess, (state) => ({
    ...state,
    loading: false,
  })),
  on(AuthActions.refreshTokenFailure, (state) => ({
    ...state,
    loading: false,
  })),

  // ---- Clear error
  on(AuthActions.clearError, (state) => ({ ...state, error: null })),

  // ---- Logout resets state
  on(AuthActions.logout, () => initialAuthState)
);

export function authReducer(
  state: AuthState | undefined,
  action: any
): AuthState {
  return reducer(state, action);
}
