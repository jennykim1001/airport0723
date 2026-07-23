import type { CongestionLabel, CongestionRecord, GateType, Terminal } from '../types';

// 공공데이터포털 "인천국제공항공사_승객예고-출·입국장별" API를
// 프론트엔드에서 직접 호출한다. (V2 PRD 7절 참고 — 키가 번들에 노출되는
// 것을 인지한 상태로 진행 중인 방식이다.)
const API_BASE_URL = 'https://apis.data.go.kr/B551177/passgrAnncmt/getPassgrAnncmt';

// 실제 응답을 콘솔로 확인해서 얻은 필드 구조.
// - adate: "YYYYMMDD" (합계 행은 "합계")
// - atime: "HH_HH+1" (합계 행은 "합계")
// - t1eg*: T1 입국장 구역별 인원, t1egsum1: T1 입국장 합계
// - t1dg*: T1 출국장 구역별 인원, t1dgsum1: T1 출국장 합계
// - t2eg*: T2 입국장 구역별 인원, t2egsum1: T2 입국장 합계
// - t2dg*: T2 출국장 구역별 인원, t2dgsum2: T2 출국장 합계 (T1과 다르게 접미사가 2)
interface PassgrAnncmtItem {
  adate: string;
  atime: string;
  t1egsum1: string;
  t1dgsum1: string;
  t2egsum1: string;
  t2dgsum2: string;
  [key: string]: string;
}

interface PassgrAnncmtResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      numOfRows: number;
      pageNo: number;
      totalCount: number;
      items: PassgrAnncmtItem[] | PassgrAnncmtItem;
    };
  };
}

function formatDate(adate: string): string {
  return `${adate.slice(0, 4)}-${adate.slice(4, 6)}-${adate.slice(6, 8)}`;
}

function formatTime(atime: string): string {
  const [hour] = atime.split('_');
  return `${hour}:00`;
}

// 응답값은 0-100 지표가 아니라 시간대별 예상 인원 수(명)다.
// 아래 구간 기준은 임시값이며, 실제 서비스 기준으로 조정이 필요하다.
function levelToLabel(level: number): CongestionLabel {
  if (level < 1000) return '원활';
  if (level < 3000) return '보통';
  return '혼잡';
}

function mapItemToRecords(item: PassgrAnncmtItem, itemIndex: number): CongestionRecord[] {
  const date = formatDate(item.adate);
  const time = formatTime(item.atime);

  const cells: Array<[Terminal, GateType, number]> = [
    ['T1', 'arrival', Number(item.t1egsum1)],
    ['T1', 'departure', Number(item.t1dgsum1)],
    ['T2', 'arrival', Number(item.t2egsum1)],
    ['T2', 'departure', Number(item.t2dgsum2)],
  ];

  return cells.map(([terminal, gateType, congestionLevel], cellIndex) => ({
    id: `${date}-${time}-${terminal}-${gateType}-${itemIndex}-${cellIndex}`,
    date,
    time,
    terminal,
    gateType,
    congestionLevel,
    congestionLabel: levelToLabel(congestionLevel),
  }));
}

async function fetchPassgrAnncmt(selectdate: 0 | 1): Promise<CongestionRecord[]> {
  const serviceKey = import.meta.env.VITE_AIRPORT_API_KEY;
  if (!serviceKey) {
    throw new Error('VITE_AIRPORT_API_KEY가 설정되지 않았습니다. .env를 확인하세요.');
  }

  // serviceKey는 공공데이터포털이 이미 percent-encoding한 값이므로
  // URLSearchParams로 다시 인코딩하지 않고 그대로 이어붙인다.
  const url = `${API_BASE_URL}?serviceKey=${serviceKey}&selectdate=${selectdate}&type=json&numOfRows=100&pageNo=1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`공공데이터 API 호출 실패 (HTTP ${response.status})`);
  }

  const data: PassgrAnncmtResponse = await response.json();
  console.log(`[getPassgrAnncmt] selectdate=${selectdate} 응답:`, data);

  const { header, body } = data.response;
  if (header.resultCode !== '00') {
    throw new Error(`공공데이터 API 오류 (${header.resultCode}): ${header.resultMsg}`);
  }

  const rawItems = body.items;
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  return items
    .filter((item) => item.atime !== '합계') // 마지막 "합계" 행은 시간대 데이터가 아니므로 제외
    .flatMap((item, index) => mapItemToRecords(item, index));
}

export async function fetchTodayCongestion(): Promise<CongestionRecord[]> {
  return fetchPassgrAnncmt(0);
}

export async function fetchTomorrowCongestion(): Promise<CongestionRecord[]> {
  return fetchPassgrAnncmt(1);
}
