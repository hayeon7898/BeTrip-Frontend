import { createContext } from 'react';

export interface AuthContextValue {
  isLoggedIn: boolean;
  login: (accessToken?: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);