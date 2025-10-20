// Defines AuthState and initialAuthState

import { User } from "src/app/models/auth.model";



// Define roles for type safety
export type Role = 'administrateur' | 'employé' | 'utilisateur';

// State interface for the auth feature
export interface AuthState {
  isLogged: boolean;
  role: Role;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Initial/default state
export const initialAuthState: AuthState = {
  isLogged: false,
  role: 'utilisateur',
  user: null,
  loading: false,
  error: null,
};
