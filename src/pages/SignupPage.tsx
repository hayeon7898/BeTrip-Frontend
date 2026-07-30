import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Typography from '../components/Typography/Typography';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import Alert from '../components/Alert/Alert';
import { useToast } from '../components/Toast/useToast';
import { useAuth } from '../context/AuthContext';
import styles from './SignupPage.module.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim() || !passwordConfirm.trim()) {
      setErrorMessage('모든 항목을 입력해주세요');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('비밀번호는 8자 이상이어야 해요');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호가 일치하지 않아요');
      return;
    }

    // TODO: 실제 회원가입 API 연동 전까지는 입력값 검증만 하고 바로 로그인 처리합니다.
    setErrorMessage(null);
    login();
    showToast({ variant: 'success', message: '회원가입이 완료되었습니다' });
    navigate('/home', { replace: true });
  };

  return (
    <div className={styles.page}>
      <Header showAuthButton={false} />

      <div className={styles.main}>
        <div className={styles.card}>
          <Typography variant="display" className={styles.title}>
            회원가입
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
                placeholder="betrip@example.com"
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
                placeholder="8자 이상 입력해주세요"
              />
            </div>

            <div className={styles.field}>
              <Typography variant="caption" color="secondary" className={styles.label}>
                비밀번호 확인
              </Typography>
              <Input
                type="password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                placeholder="비밀번호를 다시 입력해주세요"
              />
            </div>

            {errorMessage && (
              <Alert variant="error" className={styles.errorAlert}>
                {errorMessage}
              </Alert>
            )}

            <Button type="submit" variant="primary" size="lg" className={styles.submitButton}>
              회원가입
            </Button>
          </form>

          <div className={styles.footerRow}>
            <Typography variant="caption" color="tertiary">
              이미 계정이 있으신가요?
            </Typography>
            <button type="button" className={styles.linkButton} onClick={() => navigate('/login')}>
              로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}