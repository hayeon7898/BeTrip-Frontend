import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

interface HeaderProps {
  /** 로고 클릭 시 이동 경로 (기본값: '/') */
  logoTo?: string;
  /** 로그인/로그아웃 버튼 표시 여부 (기본값: true). 로그인 페이지 등에서 숨길 때 사용 */
  showAuthButton?: boolean;
}

// 로그인 상태는 이제 AuthContext에서 직접 읽어요. 페이지마다 loggedIn을 계산해서
// prop으로 내려줄 필요가 없어졌습니다 (예전엔 URL의 ?loggedIn=true를 각 페이지가 각자 읽었어요).
export default function Header({ logoTo = '/', showAuthButton = true }: HeaderProps) {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
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