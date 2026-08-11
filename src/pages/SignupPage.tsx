import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Typography from '../components/Typography/Typography';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import Alert from '../components/Alert/Alert';
import { useToast } from '../components/Toast/useToast';
import { useAuth } from '../context/useAuth';
import { signup as signupApi, login as loginApi } from '../api/auth';
import { ApiClientError } from '../api/client';
import styles from './SignupPage.module.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim() || !passwordConfirm.trim() || !nickname.trim()) {
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

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signupApi({ email, password, nickname });
      const loginResult = await loginApi({ email, password });
      login(loginResult.access_token);
      showToast({ variant: 'success', message: '회원가입이 완료되었습니다' });
      navigate('/home', { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('회원가입 중 오류가 발생했어요. 잠시 후 다시 시도해주세요');
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
                닉네임
              </Typography>
              <Input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="2~50자로 입력해주세요"
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
                placeholder="대/소문자, 숫자, 특수문자 포함 8자 이상"
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? '가입 중...' : '회원가입'}
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