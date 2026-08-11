import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from './tokenStore';

const BASE_URL = '/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Refresh Token 쿠키를 주고받기 위해 필수
});

// 요청마다 최신 Access Token을 자동으로 헤더에 실어줌
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 동시에 여러 요청이 401을 맞아도 refresh는 한 번만 실행되도록 공유
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  // apiClient를 그대로 쓰면 이 요청도 인터셉터를 타서 무한루프 위험이 있어 별도 호출
  const response = await axios.post<{ access_token: string }>(
    `${BASE_URL}/auth/refresh`,
    null,
    { withCredentials: true },
  );
  return response.data.access_token;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/login');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        setAccessToken(newToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        setAccessToken(null); // refresh도 실패하면 로그아웃 상태로
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export class ApiClientError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface ValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface ErrorResponseData {
  detail?: string | ValidationErrorItem[];
}

export function toApiClientError(error: unknown): ApiClientError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data as ErrorResponseData | undefined;

    let message = '요청 처리 중 오류가 발생했어요';

    if (typeof data?.detail === 'string') {
      // 우리가 직접 던진 HTTPException (401, 409 등)
      message = data.detail;
    } else if (Array.isArray(data?.detail) && data.detail.length > 0) {
      // Pydantic 자동 검증 실패 (422) - 첫 번째 에러 메시지만 사용
      message = data.detail[0].msg.replace('Value error, ', '');
    }

    return new ApiClientError(status, message);
  }
  return new ApiClientError(0, '알 수 없는 오류가 발생했어요');
}