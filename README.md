# BeTrip Frontend

여행 일정 만드는 웹 프론트엔드입니다.

## 🛠 기술 스택

- React 19
- Vite 8
- ESLint 10

## 🚀 시작하기

### 요구 사항

- Node.js v20.x 이상
- npm

### 설치 및 실행

\`\`\`bash
# 1. 클론
git clone https://github.com/사용자명/betrip-frontend.git
cd betrip-frontend

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev
\`\`\`

브라우저에서 http://localhost:5173 접속

## 📁 폴더 구조

\`\`\`
src/
  components/   # 재사용 UI 컴포넌트
  pages/        # 라우트별 페이지
  store/        # zustand store
  hooks/        # 커스텀 훅
  utils/        # 유틸 함수 (날짜 계산 등)
  types/        # 타입 정의
\`\`\`

## 🌿 브랜치 전략

| 브랜치 | 역할 |
| --- | --- |
| `main` | 운영 배포 |
| `develop` | 개발 통합 |

- `main`에 직접 push 금지
- `develop`(에서 생성한 브랜치)만 사용, `develop`도 직접 push 금지 → PR 기반 merge

### 작업 순서

1. **issue 생성** (이슈 템플릿 사용) → **브랜치 생성** → 작업
2. 브랜치 네이밍: `type/#issueNumber-description`

\`\`\`
feat/#12-login-api
fix/#31-assets-chart
refactor/#44-home-layout
docs/#55-api-spec
\`\`\`

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

## 📝 커밋 규칙

- 형식: `type: description` + 본문에 상세 설명
- **하나의 커밋에는 하나의 작업만** 포함
- 커밋 내용은 **한국어**, 이슈 번호는 `(#Number)` 형식으로 footer에 작성
- `.gitmessage` 템플릿 사용 (설정법은 하단 참고)

\`\`\`
type(scope): subject

# 본문 (선택) - 무엇을 왜 변경했는지, 한 줄 72자 이내 권장
- 로그인 실패 시 예외 처리 추가
- JWT 만료 검증 로직 수정

# Footer (선택) - 관련 이슈
Closes #이슈번호
Related to #이슈번호
\`\`\`

**작성 규칙**
- 제목은 50자 이내
- 제목과 본문 사이 한 줄 공백
- 제목 끝에 마침표(.) 금지
- 명령문 형태 사용 (예: `수정한다`(X) → `수정`(O))

### .gitmessage 템플릿 설정

\`\`\`bash
git config commit.template .gitmessage
\`\`\`

## 🔀 PR 규칙

- 작업 완료 후 PR 생성, PR 템플릿 사용
- PR 제목 형식: `[type] 작업 내용`

\`\`\`
[feat] 로그인 API 연동
[chore] 프로젝트 초기 설정
\`\`\`

## ✅ Merge 규칙

- `main`에 직접 merge 금지
- 개발 시 `develop` 브랜치만 사용 (force push, 직접 push 금지 → PR 기반 merge)
- **squash merge** 사용 (1개 issue → 1개 branch → 여러 커밋 → 최종 squash merge)
- merge 완료 후 브랜치 삭제
