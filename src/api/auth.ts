import { apiClient } from './client';

interface LoginResponse {
  access_token: string;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/auth/login', { email, password });
}
