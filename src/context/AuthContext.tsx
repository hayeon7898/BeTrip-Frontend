import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContextObject';

// 새로고침해도 로그인 상태가 풀리지 않도록 세션 동안만 유지합니다(탭/브라우저 종료 시 초기화).
// 실제 인증이 붙으면 이 부분은 토큰 저장 방식(httpOnly 쿠키 등)으로 대체하는 걸 권장해요.
const STORAGE_KEY = 'betrip:isLoggedIn';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === 'true',
  );

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, String(isLoggedIn));
  }, [isLoggedIn]);

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>{children}</AuthContext.Provider>
  );
}