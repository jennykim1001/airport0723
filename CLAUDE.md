# CLAUDE.md

## 프로젝트 개요
인천공항 혼잡도 공공데이터를 보여주고, 로그인한 사용자의 즐겨찾기를
Supabase Database에 저장하는 대시보드. (PRD.md 참고)

## 반드시 지킬 규칙
- 공공데이터포털 API 키는 `.env`의 `VITE_AIRPORT_API_KEY`로 관리한다.
- Supabase URL과 anon key는 `.env`의 `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY`로 관리한다.
- 즐겨찾기 테이블은 RLS를 켜고 "본인 데이터만" 정책을 적용한다.
- `.env`는 `.gitignore`에 포함한다.
- 화면은 목업 데이터로 먼저 만들고, 마지막에 실제 연동으로 교체한다.
- 데이터 함수 이름은 PRD.md의 정의를 따른다.
- Supabase 관련 작업(테이블, RLS)은 Supabase MCP 도구로 수행한다.
- (임시) Supabase MCP로 작업할 때는 반드시 "booking"
  프로젝트(URL: https://amckvgefjiygdiijnhxz.supabase.co)에만 작업하고, 다른
  프로젝트는 절대 건드리지 않는다.

## 기술 스택
React + TypeScript + Vite, recharts, Supabase(Auth/Database, MCP로
관리), 공공데이터포털 API (프론트엔드에서 직접 호출)
