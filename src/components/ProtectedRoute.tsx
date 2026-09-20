import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div>로딩 중...</div>; // refresh가 끝날 때까지 대기
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
}