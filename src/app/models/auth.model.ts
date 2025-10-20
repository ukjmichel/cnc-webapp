// Role type (unified!)
export type Role = 'administrateur' | 'employé' | 'utilisateur';

// User interface (unified!)
export interface User {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  verified: boolean;
  role?: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  message: string;
  data: {
    user: User;
  };
}

export interface RegisterResponse {
  message: string;
  data: User;
}
