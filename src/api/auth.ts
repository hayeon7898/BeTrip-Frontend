import { apiClient, toApiClientError } from './client';
import type { SignupRequest, LoginRequest, UserResponse, TokenResponse } from '../types/auth';

export async function signup(data: SignupRequest): Promise<UserResponse> {
  try {
    const response = await apiClient.post<UserResponse>('/auth/signup', data);
    return response.data;
  } catch (error) {
    throw toApiClientError(error);
  }
}

export async function login(data: LoginRequest): Promise<TokenResponse> {
  try {
    const response = await apiClient.post<TokenResponse>('/auth/login', data);
    return response.data;
  } catch (error) {
    throw toApiClientError(error);
  }
}

export async function refresh(): Promise<TokenResponse> {
  try {
    const response = await apiClient.post<TokenResponse>('/auth/refresh');
    return response.data;
  } catch (error) {
    throw toApiClientError(error);
  }
}