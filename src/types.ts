export type Terminal = 'T1' | 'T2';
export type GateType = 'arrival' | 'departure';
export type CongestionLabel = '원활' | '보통' | '혼잡';

export interface CongestionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  terminal: Terminal;
  gateType: GateType;
  congestionLevel: number; // 0-100
  congestionLabel: CongestionLabel;
}

export interface FavoriteSlot {
  id: string;
  userId: string;
  date: string;
  time: string;
  terminal: Terminal;
  gateType: GateType;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
}
