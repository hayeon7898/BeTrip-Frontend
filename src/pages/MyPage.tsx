import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header/Header';
import Typography from '../components/Typography/Typography';
import Button from '../components/Button/Button';
import Card from '../components/Card/Card';
import ConfirmModal from '../components/Modal/ConfirmModal';
import { formatDateRange, formatDday, getTodayKST } from '../utils/date';
import styles from './MyPage.module.css';

interface Plan {
  id: string;
  title: string;
  region: string;
  startDate: string;
  endDate: string;
}

const DUMMY_PLANS: Plan[] = [
  { id: '1', title: '제주도 힐링 여행', region: '제주도', startDate: '2026-08-10', endDate: '2026-08-13' },
  { id: '2', title: '부산 맛집 투어', region: '부산', startDate: '2026-09-02', endDate: '2026-09-04' },
  { id: '3', title: '강릉 바다 여행', region: '강릉', startDate: '2026-10-15', endDate: '2026-10-17' },
  { id: '4', title: '서울 벚꽃 나들이', region: '서울', startDate: '2025-04-01', endDate: '2025-04-03' },
];

export default function MyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasPlans = searchParams.get('hasPlans') !== 'false';
  const loggedIn = searchParams.get('loggedIn') !== 'false';

  const [plans, setPlans] = useState<Plan[]>(hasPlans ? DUMMY_PLANS : []);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);

  const today = getTodayKST();
  const upcomingPlans = plans
    .filter((plan) => plan.endDate >= today)
    .sort((a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0));
  const pastPlans = plans
    .filter((plan) => plan.endDate < today)
    .sort((a, b) => (a.endDate > b.endDate ? -1 : a.endDate < b.endDate ? 1 : 0));

  const renderPlanCard = (plan: Plan, isPast: boolean) => (
    <Card
      key={plan.id}
      className={[styles.card, isPast ? styles.pastCard : ''].filter(Boolean).join(' ')}
      title={plan.title}
      subtitle={`${plan.region} · ${formatDateRange(plan.startDate, plan.endDate)}`}
      onClick={() => navigate(`/plan/${plan.id}`)}
      badge={!isPast ? formatDday(plan.startDate, today) : undefined}
      onDelete={() => setDeleteTarget(plan)}
    />
  );

  return (
    <div className={styles.page}>
      <Header loggedIn={loggedIn} />

      <div className={styles.container}>
        <Typography variant="h1" className={styles.title}>
          내 일정
        </Typography>

        {plans.length > 0 ? (
          <>
            {upcomingPlans.length > 0 && (
              <div className={styles.section}>
                <Typography variant="h3" className={styles.sectionTitle}>
                  예정된 여행
                </Typography>
                <div className={styles.list}>{upcomingPlans.map((plan) => renderPlanCard(plan, false))}</div>
              </div>
            )}

            {pastPlans.length > 0 && (
              <div className={styles.section}>
                <Typography variant="h3" className={styles.sectionTitle}>
                  지난 여행
                </Typography>
                <div className={styles.list}>{pastPlans.map((plan) => renderPlanCard(plan, true))}</div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <Typography variant="h3" className={styles.emptyTitle}>
              아직 만든 일정이 없어요
            </Typography>
            <Button variant="primary" size="lg" onClick={() => navigate('/plan/create')}>
              일정 만들기
            </Button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="일정을 삭제할까요?"
        description={deleteTarget ? `${deleteTarget.title} 일정이 삭제됩니다` : undefined}
        confirmLabel="삭제"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          setPlans((prev) => prev.filter((p) => p.id !== deleteTarget?.id));
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
