import type { CongestionRecord, FavoriteSlot } from '../types';

// NOTE: 지금은 화면 뼈대 확인용 하드코딩 데이터다.
// 나중에 congestionService/favoritesService 내부 구현만
// 실제 API/Supabase 연동으로 교체하고, 함수 시그니처는 그대로 재사용한다.

export const mockAvailableTimes: string[] = [
  '06:00',
  '09:00',
  '12:00',
  '15:00',
  '18:00',
  '21:00',
];

export const TODAY = '2026-07-23';
export const TOMORROW = '2026-07-24';

function buildDayRecords(date: string, prefix: string): CongestionRecord[] {
  const pattern: Array<[string, 'T1' | 'T2', 'arrival' | 'departure', number, '원활' | '보통' | '혼잡']> = [
    ['06:00', 'T1', 'departure', 20, '원활'],
    ['06:00', 'T1', 'arrival', 12, '원활'],
    ['06:00', 'T2', 'departure', 30, '원활'],
    ['06:00', 'T2', 'arrival', 15, '원활'],
    ['09:00', 'T1', 'departure', 42, '보통'],
    ['09:00', 'T1', 'arrival', 18, '원활'],
    ['09:00', 'T2', 'departure', 71, '혼잡'],
    ['09:00', 'T2', 'arrival', 35, '보통'],
    ['12:00', 'T1', 'departure', 55, '보통'],
    ['12:00', 'T1', 'arrival', 40, '보통'],
    ['12:00', 'T2', 'departure', 60, '보통'],
    ['12:00', 'T2', 'arrival', 33, '보통'],
    ['15:00', 'T1', 'departure', 48, '보통'],
    ['15:00', 'T1', 'arrival', 22, '원활'],
    ['15:00', 'T2', 'departure', 65, '혼잡'],
    ['15:00', 'T2', 'arrival', 38, '보통'],
    ['18:00', 'T1', 'departure', 68, '혼잡'],
    ['18:00', 'T1', 'arrival', 45, '보통'],
    ['18:00', 'T2', 'departure', 80, '혼잡'],
    ['18:00', 'T2', 'arrival', 50, '보통'],
    ['21:00', 'T1', 'departure', 30, '원활'],
    ['21:00', 'T1', 'arrival', 20, '원활'],
    ['21:00', 'T2', 'departure', 40, '보통'],
    ['21:00', 'T2', 'arrival', 25, '원활'],
  ];

  return pattern.map(([time, terminal, gateType, level, label], index) => ({
    id: `${prefix}-${index + 1}`,
    date,
    time,
    terminal,
    gateType,
    congestionLevel: level,
    congestionLabel: label,
  }));
}

export const mockTodayCongestion: CongestionRecord[] = buildDayRecords(TODAY, 't');
export const mockTomorrowCongestion: CongestionRecord[] = buildDayRecords(TOMORROW, 'n');

export const mockFavorites: FavoriteSlot[] = [
  { id: 'f-1', userId: 'mock-user-1', date: TODAY, time: '09:00', terminal: 'T1', gateType: 'departure', createdAt: '2026-07-20T10:00:00Z' },
  { id: 'f-2', userId: 'mock-user-1', date: TOMORROW, time: '18:00', terminal: 'T2', gateType: 'arrival', createdAt: '2026-07-21T08:30:00Z' },
  { id: 'f-3', userId: 'mock-user-1', date: TODAY, time: '21:00', terminal: 'T1', gateType: 'arrival', createdAt: '2026-07-22T12:15:00Z' },
];
