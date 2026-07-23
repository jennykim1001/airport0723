import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { Header } from './components/Header';
import { DateTimeSelector } from './components/DateTimeSelector';
import { CongestionDetailCard } from './components/CongestionDetailCard';
import { TerminalCompareChart } from './components/TerminalCompareChart';
import { CongestionTrendChart } from './components/CongestionTrendChart';
import { FavoritesList } from './components/FavoritesList';
import { fetchTodayCongestion, fetchTomorrowCongestion } from './services/congestionService';
import { addFavorite, listFavorites, removeFavorite } from './services/favoritesService';
import {
  getCurrentUser,
  onAuthStateChange,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from './services/authService';
import { mockAvailableTimes, TOMORROW } from './mock/mockData';
import type { AuthUser, CongestionRecord, FavoriteSlot } from './types';

type DayMode = 'today' | 'tomorrow';

function App() {
  const [dayMode, setDayMode] = useState<DayMode>('today');
  const [selectedTime, setSelectedTime] = useState(mockAvailableTimes[1]);
  const [records, setRecords] = useState<CongestionRecord[]>([]);
  const [isLoadingCongestion, setIsLoadingCongestion] = useState(false);
  const [congestionError, setCongestionError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteSlot[]>([]);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    getCurrentUser().then(setUser);
    const unsubscribe = onAuthStateChange(setUser);
    return unsubscribe;
  }, []);

  const loadCongestion = async (mode: DayMode) => {
    setIsLoadingCongestion(true);
    setCongestionError(null);
    try {
      const load = mode === 'today' ? fetchTodayCongestion : fetchTomorrowCongestion;
      const data = await load();
      setRecords(data);
    } catch (error) {
      setRecords([]);
      setCongestionError(error instanceof Error ? error.message : '혼잡도 데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoadingCongestion(false);
    }
  };

  useEffect(() => {
    loadCongestion(dayMode);
  }, [dayMode]);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    listFavorites(user.id)
      .then(setFavorites)
      .catch((error) => {
        setFavoritesError(error instanceof Error ? error.message : '즐겨찾기를 불러오지 못했습니다.');
      });
  }, [user]);

  const recordsAtSelectedTime = useMemo(
    () => records.filter((record) => record.time === selectedTime),
    [records, selectedTime]
  );

  const handleRefresh = () => {
    loadCongestion(dayMode);
  };

  const handleSaveFavorite = async (record: CongestionRecord) => {
    if (!user) return;
    setFavoritesError(null);
    try {
      const created = await addFavorite({
        userId: user.id,
        date: record.date,
        time: record.time,
        terminal: record.terminal,
        gateType: record.gateType,
      });
      setFavorites((prev) => [created, ...prev]);
    } catch (error) {
      setFavoritesError(error instanceof Error ? error.message : '즐겨찾기 저장에 실패했습니다.');
    }
  };

  const handleSelectFavorite = (favorite: FavoriteSlot) => {
    setDayMode(favorite.date === TOMORROW ? 'tomorrow' : 'today');
    setSelectedTime(favorite.time);
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    setFavoritesError(null);
    try {
      await removeFavorite(favoriteId);
      setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
    } catch (error) {
      setFavoritesError(error instanceof Error ? error.message : '즐겨찾기 삭제에 실패했습니다.');
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setIsAuthSubmitting(true);
    setAuthError(null);
    try {
      const signedInUser = await signInWithEmail(email, password);
      setUser(signedInUser);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    setIsAuthSubmitting(true);
    setAuthError(null);
    try {
      const signedUpUser = await signUpWithEmail(email, password);
      if (signedUpUser) {
        setUser(signedUpUser);
      } else {
        setAuthError('가입 확인 이메일을 확인한 뒤 로그인해주세요.');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <div className="app">
      <Header
        dayMode={dayMode}
        isDark={isDark}
        onRefresh={handleRefresh}
        onToggleDark={() => setIsDark((prev) => !prev)}
        user={user}
        isAuthSubmitting={isAuthSubmitting}
        authError={authError}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onSignOut={handleSignOut}
      />

      <main className="app__main">
        <div className="app__primary">
          <DateTimeSelector
            dayMode={dayMode}
            onDayModeChange={setDayMode}
            availableTimes={mockAvailableTimes}
            selectedTime={selectedTime}
            onTimeChange={setSelectedTime}
          />

          {isLoadingCongestion && <p role="status">불러오는 중...</p>}
          {!isLoadingCongestion && congestionError && (
            <p role="alert" className="error-message">
              {congestionError}
            </p>
          )}

          {!isLoadingCongestion && !congestionError && (
            <>
              <CongestionDetailCard
                records={recordsAtSelectedTime}
                canSaveFavorite={Boolean(user)}
                onSaveFavorite={handleSaveFavorite}
              />

              <TerminalCompareChart records={recordsAtSelectedTime} />
              <CongestionTrendChart records={records} />
            </>
          )}
        </div>

        <aside className="app__sidebar">
          {favoritesError && (
            <p role="alert" className="error-message">
              {favoritesError}
            </p>
          )}
          {user ? (
            <FavoritesList
              favorites={favorites}
              onSelect={handleSelectFavorite}
              onRemove={handleRemoveFavorite}
            />
          ) : (
            <section className="favorites-list">
              <h2>즐겨찾기</h2>
              <p>로그인하면 즐겨찾기를 저장하고 볼 수 있습니다.</p>
            </section>
          )}
        </aside>
      </main>
    </div>
  );
}

export default App;
