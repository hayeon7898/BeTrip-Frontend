import { apiClient, refreshAccessToken, toApiClientError } from './client';
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
    const access_token = await refreshAccessToken();
    return { access_token } as TokenResponse; // TokenResponse에 다른 필드가 있으면 맞춰주세요
  } catch (error) {
    throw toApiClientError(error);
  }
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // 서버 실패해도 클라이언트 로그아웃은 진행
  }
}
