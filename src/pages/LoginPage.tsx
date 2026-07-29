import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Typography from '../components/Typography/Typography';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import Alert from '../components/Alert/Alert';
import { useToast } from '../components/Toast/useToast';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요');
      return;
    }

    // TODO: 실제 로그인 API 연동 전까지는 입력값 검증만 하고 바로 로그인 처리합니다.
    // 다른 페이지들도 전부 loggedIn 쿼리 파라미터로 로그인 상태를 흉내내고 있어서 동일하게 맞췄어요.
    setErrorMessage(null);
    showToast({ variant: 'success', message: '로그인되었습니다' });
    navigate('/home?loggedIn=true');
  };

  return (
    <div className={styles.page}>
      <Header showAuthButton={false} />

      <div className={styles.main}>
        <div className={styles.card}>
          <Typography variant="display" className={styles.title}>
            로그인
          </Typography>
          <Typography variant="body" color="secondary" className={styles.subtitle}>
            BeTrip과 함께 다음 여행을 준비해보세요
          </Typography>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <Typography variant="caption" color="secondary" className={styles.label}>
                이메일
              </Typography>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className={styles.field}>
              <Typography variant="caption" color="secondary" className={styles.label}>
                비밀번호
              </Typography>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            {errorMessage && (
              <Alert variant="error" className={styles.errorAlert}>
                {errorMessage}
              </Alert>
            )}

            <Button type="submit" variant="primary" size="lg" className={styles.submitButton}>
              로그인
            </Button>
          </form>

          <div className={styles.footerRow}>
            <Typography variant="caption" color="tertiary">
              계정이 없으신가요?
            </Typography>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => showToast({ variant: 'info', message: '회원가입 페이지는 준비 중이에요' })}
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}