import { LoginButton } from './LoginButton';
import type { AuthUser } from '../types';

interface HeaderProps {
  dayMode: 'today' | 'tomorrow';
  isDark: boolean;
  onRefresh: () => void;
  onToggleDark: () => void;
  user: AuthUser | null;
  isAuthSubmitting: boolean;
  authError: string | null;
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
  onSignOut: () => void;
}

export function Header({
  dayMode,
  isDark,
  onRefresh,
  onToggleDark,
  user,
  isAuthSubmitting,
  authError,
  onSignIn,
  onSignUp,
  onSignOut,
}: HeaderProps) {
  return (
    <header className="app-header">
      <h1 className="app-header__title">인천공항 혼잡도 대시보드</h1>
      <div className="app-header__actions">
        <button type="button" onClick={onRefresh}>
          {dayMode === 'today' ? '오늘' : '내일'} 새로고침
        </button>
        <button type="button" onClick={onToggleDark}>
          {isDark ? '라이트 모드' : '다크 모드'}
        </button>
        <LoginButton
          user={user}
          isSubmitting={isAuthSubmitting}
          error={authError}
          onSignIn={onSignIn}
          onSignUp={onSignUp}
          onSignOut={onSignOut}
        />
      </div>
    </header>
  );
}
