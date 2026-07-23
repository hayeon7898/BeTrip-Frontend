import { useNavigate, useSearchParams } from 'react-router-dom';
import Typography from '../components/Typography/Typography';
import Button from '../components/Button/Button';
import heroImage from '../assets/hero.png';
import styles from './HomePage.module.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loggedIn = searchParams.get('loggedIn') === 'true';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.logo}>BeTrip</div>

        {loggedIn ? (
          <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>
            로그아웃
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            로그인
          </Button>
        )}
      </div>

      <div className={styles.main}>
        <div className={styles.intro}>
          <Typography variant="display">
            다음 여행,
            <br />
            BeTrip이 짜드릴게요
          </Typography>

          <Typography variant="body" color="secondary" className={styles.description}>
            기간과 취향만 알려주시면
            <br />
            어울리는 장소로 일정을 완성해드려요.
          </Typography>

          <div className={styles.ctaGroup}>
            <Button variant="primary" size="lg" onClick={() => navigate('/plan/create')}>
              일정 만들기
            </Button>

            {loggedIn && (
              <Button variant="outline" size="lg" onClick={() => navigate('/my')}>
                내 일정 보기
              </Button>
            )}
          </div>
        </div>

        <div className={styles.hero}>
          <img src={heroImage} alt="여행 일러스트" className={styles.heroImage} />
        </div>
      </div>
    </div>
  );
}
