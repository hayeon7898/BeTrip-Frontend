import { Link } from 'react-router-dom';

interface DevRoute {
  label: string;
  path: string;
}

const routes: DevRoute[] = [
  { label: '홈페이지', path: '/' },
  { label: '로그인', path: '/login' },
  { label: '일정 만들기', path: '/plan/create' },
  { label: '마이페이지', path: '/my' },
  { label: '장소', path: '/place' },
  { label: '일정', path: '/plan/1' }, // 상세는 id 필요해서 임시값
  { label: '디자인 시스템', path: '/design-system' },
];

export default function DevHome() {
  return (
    <div style={{ padding: 40 }}>
      <h1>🛠 개발용 네비게이션</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 240 }}>
        {routes.map((r) => (
          <Link
            key={r.path}
            to={r.path}
            style={{
              padding: '10px 16px',
              border: '1px solid #ccc',
              borderRadius: 8,
              textDecoration: 'none',
              textAlign: 'center',
              color: '#111',
            }}
          >
            {r.label}
          </Link>
        ))}
      </div>
    </div>
  );
}