import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContextObject';
import { refresh as refreshApi } from '../api/auth';
import { ApiClientError } from '../api/client';
import {
  getAccessToken,
  setAccessToken as setStoredAccessToken,
  subscribeAccessToken,
} from '../api/tokenStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(getAccessToken());
  const [isLoading, setIsLoading] = useState(true);

  // 인터셉터가 tokenStore를 직접 갱신했을 때(자동 refresh 등)도
  // context가 리렌더링되도록 구독합니다.
  useEffect(() => subscribeAccessToken(setAccessTokenState), []);

  // 새로고침 시, HttpOnly 쿠키로 남아있는 refresh_token으로
  // 조용히 access token을 재발급받아 로그인 상태를 복원합니다.
  useEffect(() => {
    refreshApi()
      .then((res) => setStoredAccessToken(res.access_token))
      .catch((err) => {
        if (!(err instanceof ApiClientError && err.status === 401)) {
          console.error('토큰 갱신 중 오류:', err);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = (token: string) => setStoredAccessToken(token);
  const logout = () => setStoredAccessToken(null);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn: !!accessToken, isLoading, accessToken, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}