import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import { useAuth } from '../../context/useAuth';
import styles from './Header.module.css';

interface HeaderProps {
  logoTo?: string;
  showAuthButton?: boolean;
}

export default function Header({ logoTo = '/', showAuthButton = true }: HeaderProps) {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className={styles.header}>
      <button
        type="button"
        className={styles.logo}
        onClick={() => navigate(logoTo)}
        aria-label="BeTrip 홈으로 이동"
      >
        BeTrip
      </button>

      {showAuthButton &&
        !isLoading && // refresh 끝나기 전엔 "로그인" 버튼이 잠깐 깜빡이지 않게 숨김
        (isLoggedIn ? (
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            로그인
          </Button>
        ))}
    </div>
  );
}