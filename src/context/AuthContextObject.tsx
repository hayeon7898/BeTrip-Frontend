import { createContext } from 'react';

export interface AuthContextValue {
  isLoggedIn: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);