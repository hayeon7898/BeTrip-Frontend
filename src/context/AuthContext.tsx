import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContextObject';
import { clearAccessToken, getAccessToken, setAccessToken } from '../api/tokenStore';

// 로그인 상태는 access_token 존재 여부로 판단합니다(세션 동안만 유지, 탭/브라우저 종료 시 초기화).
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => getAccessToken() !== null);

  const login = (accessToken?: string) => {
    // accessToken 없이 호출되는 경우(SignupPage의 임시 mock)는 하연님의 회원가입
    // API 연동 전까지 기존 동작(토큰 없이 로그인 상태만 표시)을 그대로 유지합니다.
    if (accessToken) {
      setAccessToken(accessToken);
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    clearAccessToken();
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>{children}</AuthContext.Provider>
  );
}