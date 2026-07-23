import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Typography from '../components/Typography/Typography';
import Button from '../components/Button/Button';
import Card from '../components/Card/Card';
import ConfirmModal from '../components/Modal/ConfirmModal';
import styles from './MyPage.module.css';

interface Plan {
  id: string;
  title: string;
  region: string;
  period: string;
}

const DUMMY_PLANS: Plan[] = [
  { id: '1', title: '제주도 힐링 여행', region: '제주도', period: '2026.08.10 - 08.13' },
  { id: '2', title: '부산 맛집 투어', region: '부산', period: '2026.09.02 - 09.04' },
  { id: '3', title: '강릉 바다 여행', region: '강릉', period: '2026.10.15 - 10.17' },
];

export default function MyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasPlans = searchParams.get('hasPlans') !== 'false';

  const [plans, setPlans] = useState<Plan[]>(hasPlans ? DUMMY_PLANS : []);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Typography variant="h1" className={styles.title}>
          내 일정
        </Typography>

        {plans.length > 0 ? (
          <div className={styles.list}>
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={styles.card}
                style={{ position: 'relative', paddingRight: 44 }}
                title={plan.title}
                subtitle={`${plan.region} · ${plan.period}`}
                onClick={() => navigate(`/plan/${plan.id}`)}
              >
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    setDeleteTarget(plan);
                  }}
                >
                  ×
                </button>
              </Card>
            ))}
          </div>
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
