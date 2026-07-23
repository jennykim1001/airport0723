import { useEffect, useState } from 'react';
import type { AuthUser } from '../types';

type AuthMode = 'signin' | 'signup';

interface LoginButtonProps {
  user: AuthUser | null;
  isSubmitting: boolean;
  error: string | null;
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
  onSignOut: () => void;
}

export function LoginButton({ user, isSubmitting, error, onSignIn, onSignUp, onSignOut }: LoginButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setEmail('');
    setPassword('');
  }, [user]);

  if (user) {
    return (
      <div className="auth-widget">
        <span className="auth-widget__email">{user.email}</span>
        <button type="button" onClick={onSignOut}>
          로그아웃
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      onSignIn(email, password);
    } else {
      onSignUp(email, password);
    }
  };

  return (
    <div className="auth-widget">
      <button type="button" onClick={() => setIsOpen((prev) => !prev)}>
        로그인
      </button>

      {isOpen && (
        <div className="auth-panel">
          <div className="auth-panel__tabs">
            <button
              type="button"
              className={mode === 'signin' ? 'is-active' : ''}
              onClick={() => setMode('signin')}
            >
              로그인
            </button>
            <button
              type="button"
              className={mode === 'signup' ? 'is-active' : ''}
              onClick={() => setMode('signup')}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '처리 중...' : mode === 'signin' ? '로그인' : '회원가입'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
