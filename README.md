# 인천공항 혼잡도 대시보드 (V2)

공공데이터포털의 인천국제공항 여객 혼잡도 데이터를 조회하고, 로그인한 사용자가 자주 보는 날짜·시간 조합을 즐겨찾기로 저장할 수 있는 대시보드. 상세 요구사항은 [PRD.md](./PRD.md) 참고.

## 기술 스택

- **React 19 + TypeScript + Vite** — 프론트엔드
- **recharts** — 터미널별 혼잡도 비교/추이 그래프
- **Supabase**
  - **Auth**: 이메일/비밀번호 회원가입·로그인·로그아웃
  - **Database**: 즐겨찾기(`favorites`) 테이블, Row Level Security 적용
- **공공데이터포털 API**: 인천국제공항공사 승객예고(터미널별 입국장/출국장 혼잡 인원) — 프론트엔드에서 직접 호출 (서버리스 프록시 없음)
- **배포 대상**: Vercel

## 폴더 구조

```
src/
  App.tsx                     # 최상위 상태(오늘/내일, 로그인, 즐겨찾기)와 화면 조립
  types.ts                    # Terminal / GateType / CongestionRecord / FavoriteSlot / AuthUser 타입
  components/
    Header.tsx                 # 타이틀, 새로고침, 다크모드 토글, 로그인 위젯
    LoginButton.tsx             # 이메일/비밀번호 로그인·회원가입 폼 + 로그아웃
    DateTimeSelector.tsx        # 오늘/내일 탭 + 시간 선택
    CongestionDetailCard.tsx    # T1/T2 × 입국장/출국장 4개 카드 + 즐겨찾기 저장 버튼
    TerminalCompareChart.tsx    # 선택 시간대 T1 vs T2 비교 차트
    CongestionTrendChart.tsx    # 하루 전체 시간대 추이 차트
    FavoritesList.tsx           # 즐겨찾기 목록(선택 이동 + 삭제)
  services/
    congestionService.ts        # 공공데이터 API 직접 호출 (fetchTodayCongestion/fetchTomorrowCongestion)
    authService.ts              # Supabase Auth 래퍼
    favoritesService.ts          # 즐겨찾기 CRUD (listFavorites/addFavorite/removeFavorite)
  lib/
    supabaseClient.ts            # Supabase 클라이언트 싱글턴
  mock/
    mockData.ts                  # 개발 초기 목업 혼잡도/즐겨찾기 데이터 (화면 뼈대 확인용)
```

## 데이터 흐름

### 1. 혼잡도 조회 (`congestionService.ts`)
- 공공데이터포털 `getPassgrAnncmt` API를 `fetch`로 직접 호출한다 (`selectdate=0` 오늘 / `1` 내일).
- 응답의 `adate`(`YYYYMMDD`), `atime`(`HH_HH+1`) 문자열을 `YYYY-MM-DD`, `HH:mm` 형식으로 변환한다.
- 터미널·게이트타입별 합계 필드(`t1egsum1`, `t1dgsum1`, `t2egsum1`, `t2dgsum2`)를 4개의 `CongestionRecord`로 매핑한다.
- 응답값은 0~100 지표가 아니라 시간대별 예상 인원 수이며, 임시 기준(1000명/3000명)으로 원활/보통/혼잡 라벨을 매긴다.
- `합계` 행(마지막 요약 행)은 시간대 데이터가 아니므로 제외한다.
- `App.tsx`가 오늘/내일 탭 전환 시 이 함수들을 호출해 상태에 저장하고, 로딩/에러 UI를 담당한다 (서비스 계층은 순수 함수, React 상태는 두지 않음).

### 2. 즐겨찾기 (`favoritesService.ts` + Supabase `favorites` 테이블)
- 로그인한 사용자가 혼잡도 카드에서 "즐겨찾기 저장"을 누르면 `addFavorite`으로 현재 날짜·시간·터미널·게이트타입 조합을 저장한다.
- 즐겨찾기 목록은 `listFavorites(userId)`로 본인 소유 행만 조회한다.
- 목록에서 항목 클릭 시 해당 날짜·시간으로 화면이 즉시 이동하고, 삭제 버튼으로 `removeFavorite`을 호출한다.
- 비로그인 사용자에게는 저장 버튼 대신 로그인 안내 문구를 보여준다.
- DB 컬럼(`snake_case`: `user_id`, `adate`, `atime`, `gate_type`)과 프론트엔드 타입(`camelCase`: `FavoriteSlot`) 간 매핑은 서비스 계층에서만 처리한다.
- 목업 단계(`mock/mockData.ts`의 배열 조작)와 실제 연동 단계 모두 `listFavorites` / `addFavorite` / `removeFavorite` 함수 시그니처를 동일하게 유지한다 (PRD 12절 원칙).

### 3. 인증 (`authService.ts`)
- `supabase.auth.signUp` / `signInWithPassword` / `signOut` / `onAuthStateChange`를 얇게 감싼 함수들.
- `App.tsx`가 마운트 시 `getCurrentUser()`로 세션을 복원하고, `onAuthStateChange` 구독으로 로그인 상태 변화(다른 탭 로그아웃 등)를 반영한다.
- 회원가입 시 이메일 확인이 켜져 있으면 세션 없이 `user`만 반환되므로, 이 경우 로그인 안내 메시지를 띄운다.

## Supabase 데이터베이스

### `favorites` 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | `uuid` (PK) | 기본값 `gen_random_uuid()` |
| `user_id` | `uuid` (FK → `auth.users.id`) | 소유 사용자, `on delete cascade` |
| `adate` | `date` | 즐겨찾기한 날짜 |
| `atime` | `time` | 즐겨찾기한 시간 |
| `terminal` | `text` | `T1` \| `T2` (check 제약) |
| `gate_type` | `text` | `arrival` \| `departure` (check 제약) |
| `created_at` | `timestamptz` | 기본값 `now()` |

### RLS (Row Level Security)

- `favorites` 테이블은 RLS가 **활성화**되어 있으며, 정책이 없으면 아무도 접근할 수 없다.
- `authenticated` 역할에 대해 `auth.uid() = user_id` 조건으로 3개 정책을 적용:
  - `favorites_select_own` (`SELECT`)
  - `favorites_insert_own` (`INSERT`)
  - `favorites_delete_own` (`DELETE`)
- `UPDATE`는 이번 범위에서 필요하지 않아 정책을 만들지 않았다 (기본 비허용).

## 환경 변수

`.env` (커밋되지 않음, `.gitignore`에 포함):

| 변수명 | 설명 |
|---|---|
| `VITE_AIRPORT_API_KEY` | 공공데이터포털 발급 서비스 키 |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon(public) key — RLS 전제하에 공개되어도 되는 키 |

> `VITE_` 접두사 환경변수는 Vite 빌드 결과물(JS 번들)에 그대로 포함되어 브라우저에서 열람 가능하다. 공공데이터 API 키 노출은 인지된 트레이드오프이며(PRD 7.1절), Supabase anon key는 RLS가 실제 접근 제어를 담당하므로 공개되어도 안전하다.

## 개발 순서

1. 혼잡도/즐겨찾기 화면을 목업 데이터(`mock/mockData.ts`)로 먼저 구성.
2. `congestionService.ts`를 공공데이터포털 API 직접 호출로 교체.
3. `favoritesService.ts`를 Supabase `favorites` 테이블 CRUD로 교체, RLS 3개 정책 적용.
4. 각 단계에서 서비스 함수 시그니처는 그대로 유지해 화면 컴포넌트 변경을 최소화.

## 로컬 실행

```bash
npm install
npm run dev
```

## 알려진 제약 (Out of Scope)

- 소셜 로그인(OAuth) 미지원, 이메일/비밀번호만 지원
- 비밀번호 재설정 플로우 미구현
- 반복 요일/시간 패턴 즐겨찾기 미지원 (날짜+시간+터미널+게이트타입 단건 저장만)
- 과거(어제 이전) 데이터 조회 미지원
- 다국어(i18n) 미지원
