import { useNavigate} from 'react-router-dom';
import Header from '../components/Header/Header';
import Typography from '../components/Typography/Typography';
import Button from '../components/Button/Button';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import character1 from '../assets/character1.png';
import character2 from '../assets/character2.png';
import character3 from '../assets/character3.png';
import styles from './HomePage.module.css';

const CHARACTER_IMAGES = [character1, character2, character3];

export default function HomePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [heroImage] = useState(
    () => CHARACTER_IMAGES[Math.floor(Math.random() * CHARACTER_IMAGES.length)],
  );

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.main}>
        <div className={styles.hero}>
          <img src={heroImage} alt="여행 일러스트" className={styles.heroImage} />
        </div>

        <div className={styles.intro}>
          <Typography variant="display">
            다음 여행,
            <br />
            <span className={styles.brand}>BeTrip</span>이 짜드릴게요
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

            {isLoggedIn && (
              <Button variant="outline" size="lg" onClick={() => navigate('/my')}>
                내 일정 보기
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}