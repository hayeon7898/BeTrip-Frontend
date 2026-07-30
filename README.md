# BeTrip Frontend
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-10-4B32C3?logo=eslint&logoColor=white)

<img width="230" height="214" alt="betrip_character" src="https://github.com/user-attachments/assets/74517168-e4c2-40ba-b566-ed72799a1280" />

## 🚀 시작하기
### 요구 사항
- Node.js v20.x 이상
- npm

### 설치 및 실행
```bash
# 1. 클론
git clone https://github.com/사용자명/betrip-frontend.git
cd betrip-frontend
# 2. 패키지 설치
npm install
# 3. 개발 서버 실행
npm run dev
```
브라우저에서 http://localhost:5173 접속

## 📁 폴더 구조
```plain
src/
  components/   # 재사용 UI component
  pages/        # route별 page
  context/      # React Context (전역 상태)
  store/        # zustand store
  hooks/        # custom hook
  utils/        # util function (날짜 계산 등)
  types/        # type 정의
  assets/       # image
```

## 🎨 화면 구성

| Page | Route | 설명 | Login | Issue |
| --- | --- | --- | --- | --- |
| DevHome | `/` | 개발용 진입 페이지 | X | - |
| HomePage | `/home` | 랜딩 페이지, 일정 만들기 진입점 | X | [#12](https://github.com/hayeon7898/betrip-frontend/issues/12)|
| LoginPage | `/login` | 이메일/비밀번호 로그인 | X | [#9](https://github.com/hayeon7898/betrip-frontend/issues/9) |
| SignupPage | `/signup` | 회원가입 | X | [#9](https://github.com/hayeon7898/betrip-frontend/issues/9) |
| CreatePlanPage | `/plan/create` | 일정 생성 시작 | O | [#14](https://github.com/hayeon7898/betrip-frontend/issues/14)|
| PlacePage | `/place` | 검색과 AI 채팅으로 장소를 추천받고 카테고리(음식점/카페/활동)별로 담기 | O | [#6](https://github.com/hayeon7898/betrip-frontend/issues/6) |
| PlanPage | `/plan/:id` | Day별 지도(카카오맵)와 시간대별 일정 구성, 드래그앤드롭으로 장소 담기 | O | [#8](https://github.com/hayeon7898/betrip-frontend/issues/8) |
| MyPage | `/my` | 내 일정 목록 | O | [#13](https://github.com/hayeon7898/betrip-frontend/issues/13) |
| DesignSystemPage | `/design-system` | 공통 컴포넌트/토큰 카탈로그 (개발용) | X | [#2](https://github.com/hayeon7898/betrip-frontend/issues/2) |

로그인이 필요한 페이지는 `ProtectedRoute`로 감싸져 있어, 비로그인 상태로 접근하면 `/login`으로 리다이렉트되고 로그인 성공 시 원래 가려던 페이지로 자동 복귀합니다.

## 💻 대표 화면 흐름

<table>
  <tr>
    <td align="center" width="30%"><strong>1️⃣Login</strong></td>
    <td align="center" width="6%">➡️</td>
    <td align="center" width="30%"><strong>2️⃣HomePage</strong></td>
    <td align="center" width="6%">➡️</td>
    <td align="center" width="30%"><strong>3️⃣CreatePlanPage</strong></td>
  </tr>
  <tr>
    <td><img width="2758" height="1388" alt="image" src="https://github.com/user-attachments/assets/b68eee2c-de03-47c4-98fc-9a3d567362e0" /></td>
    <td></td>
    <td><img width="2879" height="1506" alt="Image" src="https://github.com/user-attachments/assets/02eca672-528b-4a8a-88da-ee5fcb48be05" /></td>
    <td></td>
    <td><img width="2845" height="1526" alt="Image" src="https://github.com/user-attachments/assets/bebe28a9-10ab-4286-9112-81a8ed07dbc7" /></td>
  </tr>
</table>

<table>
  <tr>
    <td align="center" width="30%"><strong>4️⃣PlacePage</strong></td>
    <td align="center" width="6%">➡️</td>
    <td align="center" width="30%"><strong>5️⃣PlanPage</strong></td>
    <td align="center" width="6%">➡️</td>
    <td align="center" width="30%"><strong>6️⃣MyPage</strong></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/d82e0c42-0ba9-4a44-aa93-a46aa443a332" width="100%"></td>
    <td></td>
    <td><img width="2744" height="1404" alt="image" src="https://github.com/user-attachments/assets/c47665be-ad95-4a9b-92fd-832643390653" /></td>
    <td></td>
    <td><img width="2836" height="1524" alt="Image" src="https://github.com/user-attachments/assets/9680d69a-ead3-426c-a093-172b55c585d7" /></td>
  </tr>
</table>


## 🌿 브랜치 전략

| 브랜치 | 역할 |
| --- | --- |
| `main` | 운영 배포 |
| `develop` | 개발 통합 |

### 작업 순서
1. **issue 생성** (이슈 템플릿 사용) → **브랜치 생성** → 작업
2. 브랜치 네이밍: `type/#issueNumber-description`

### 브랜치 / 커밋 타입
| 타입 | 설명 | 사용 예시 |
| --- | --- | --- |
| `feat` | 새로운 기능 추가 | 로그인 기능 추가, 자산 조회 API 구현 |
| `fix` | 버그 수정 | 차트 렌더링 오류 수정, 로그인 실패 문제 해결 |
| `refactor` | 기능 변화 없는 코드 구조 개선 | 컴포넌트 분리, 서비스 레이어 구조 개선 |
| `docs` | 문서 수정 | API 명세 수정, README 업데이트 |
| `style` | 코드 스타일 및 UI 수정 | CSS 수정, prettier 적용, 마진 조정 |
| `test` | 테스트 코드 추가 및 수정 | 단위 테스트 추가, Mock 테스트 작성 |
| `chore` | 설정·빌드·패키지 등 유지보수 | eslint 설정, dependency 업데이트 |
| `hotfix` | 운영 환경 긴급 수정 | 운영 서버 장애 수정, 긴급 배포 대응 |
