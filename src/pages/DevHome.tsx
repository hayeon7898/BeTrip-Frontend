import { Link } from 'react-router-dom';

interface DevRoute {
  label: string;
  path: string;
}

const routes: DevRoute[] = [
  { label: '홈페이지 (로그인 전)', path: '/home' },
  { label: '홈페이지 (로그인 후)', path: '/home?loggedIn=true' },
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
      <h1 style={{ textAlign: 'left', margin: '0 0 40px 0' }}>👾Dev Navigation</h1>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 12,
          maxWidth: 240,
        }}
      >
        {routes.map((r) => (
          <Link
            key={r.path}
            to={r.path}
            style={{
              padding: '10px 16px',
              border: '1px solid #ccc',
              borderRadius: 8,
              textDecoration: 'none',
              textAlign: 'left',
              color: '#111',
              width: '100%',
            }}
          >
            {r.label}
          </Link>
        ))}
      </div>
    </div>
  );
}