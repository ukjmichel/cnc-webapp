// auth.actions.ts
import { createAction, props } from '@ngrx/store';
import { LoginResponse, User } from 'src/app/models/auth.model';


// =======================================
// Session/User Actions
// =======================================

export const getUser = createAction('[Auth] Get User');

export const getUserSuccess = createAction(
  '[Auth] Get User Success',
  props<{ message: string; data: { user: User } }>()
);

export const getUserFailure = createAction(
  '[Auth] Get User Failure',
  props<{ error: string }>()
);

// =======================================
// Refresh Token Actions
// =======================================

export const refreshToken = createAction('[Auth] Refresh Token');
export const refreshTokenSuccess = createAction('[Auth] Refresh Token Success');
export const refreshTokenFailure = createAction('[Auth] Refresh Token Failure');

// =======================================
// Login Actions
// =======================================

export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<LoginResponse>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// =======================================
// Register Actions
// =======================================

export const register = createAction(
  '[Auth] Register',
  props<{
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
  }>()
);

/**
 * Make registerSuccess carry the same shape as loginSuccess,
 * so the reducer can set isLogged = true on both.
 */
export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<LoginResponse>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// =======================================
// Logout & Misc
// =======================================

export const logout = createAction('[Auth] Logout');
export const clearError = createAction('[Auth] Clear Error');
