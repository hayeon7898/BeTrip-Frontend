import { Link } from 'react-router-dom';

interface DevRouteItem {
  sub?: string;
  path: string;
}

interface DevRouteGroup {
  label: string;
  items: DevRouteItem[];
}

const groups: DevRouteGroup[] = [
  {
    label: '홈페이지',
    items: [
      { sub: '로그인 전', path: '/home' },
      { sub: '로그인 후', path: '/home?loggedIn=true' },
    ],
  },
  { label: '로그인', items: [{ path: '/login' }] },
  {
    label: '내 일정 보기',
    items: [
      { sub: '일정 있음', path: '/my' },
      { sub: '일정 없음', path: '/my?hasPlans=false' },
    ],
  },
  { label: '일정 만들기', items: [{ path: '/plan/create' }] },
  { label: '장소', items: [{ path: '/place' }] },
  { label: '일정', items: [{ path: '/plan/1' }] }, // 상세는 id 필요해서 임시값
  { label: '디자인 시스템', items: [{ path: '/design-system' }] },
];

export default function DevHome() {
  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ textAlign: 'left', margin: '0 0 40px 0' }}>👾Dev Navigation</h1>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
        {groups.map((g) => (
          <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 120, textAlign: 'left', color: '#111', fontWeight: 600 }}>
              {g.label}
            </span>
            {g.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: '10px 16px',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  textDecoration: 'none',
                  textAlign: 'left',
                  color: '#111',
                }}
              >
                {item.sub ?? '이동'}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
