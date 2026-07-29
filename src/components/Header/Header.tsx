import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import styles from './Header.module.css';

interface HeaderProps {
  /** 로그인 상태. true면 로그아웃 버튼, false면 로그인 버튼을 보여줍니다. */
  loggedIn?: boolean;
  /** 로고 클릭 시 이동 경로 (기본값: '/') */
  logoTo?: string;
  /** 로그인/로그아웃 버튼 표시 여부 (기본값: true). 로그인 페이지 등에서 숨길 때 사용 */
  showAuthButton?: boolean;
}

export default function Header({ loggedIn = false, logoTo = '/', showAuthButton = true }: HeaderProps) {
  const navigate = useNavigate();

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
        (loggedIn ? (
          <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>
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