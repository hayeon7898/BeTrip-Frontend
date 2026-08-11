import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Typography from '../components/Typography/Typography';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import Alert from '../components/Alert/Alert';
import { useToast } from '../components/Toast/useToast';
import { useAuth } from '../context/useAuth';
import { login as loginApi } from '../api/auth';
import { ApiClientError } from '../api/client';
import styles from './LoginPage.module.css';

interface LocationState {
  from?: { pathname: string };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await loginApi({ email, password });
      login(result.access_token);
      showToast({ variant: 'success', message: '로그인되었습니다' });

      const state = location.state as LocationState | null;
      const redirectTo = state?.from?.pathname ?? '/home';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('로그인 중 오류가 발생했어요. 잠시 후 다시 시도해주세요');
      }
    } finally {
      setIsSubmitting(false);
    }
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className={styles.footerRow}>
            <Typography variant="caption" color="tertiary">
              계정이 없으신가요?
            </Typography>
            <button type="button" className={styles.linkButton} onClick={() => navigate('/signup')}>
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}