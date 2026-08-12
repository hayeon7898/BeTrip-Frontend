import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Typography from '../components/Typography/Typography';
import Button from '../components/Button/Button';
import Card from '../components/Card/Card';
import ConfirmModal from '../components/Modal/ConfirmModal';
import { useToast } from '../components/Toast/useToast';
import { getItineraries, deleteItinerary } from '../api/itineraries';
import type { ItinerarySummary } from '../api/itineraries';
import { formatDateRange, formatDday, getTodayKST } from '../utils/date';
import styles from './MyPage.module.css';

export default function MyPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [plans, setPlans] = useState<ItinerarySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ItinerarySummary | null>(null);

  useEffect(() => {
    getItineraries()
      .then(setPlans)
      .catch(() => showToast({ variant: 'error', message: '일정 목록을 불러오지 못했어요' }))
      .finally(() => setIsLoading(false));
  }, [showToast]);

  const today = getTodayKST();
  const upcomingPlans = plans
    .filter((plan) => plan.end_date >= today)
    .sort((a, b) => (a.start_date < b.start_date ? -1 : a.start_date > b.start_date ? 1 : 0));
  const pastPlans = plans
    .filter((plan) => plan.end_date < today)
    .sort((a, b) => (a.end_date > b.end_date ? -1 : a.end_date < b.end_date ? 1 : 0));

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItinerary(deleteTarget.itinerary_id);
      setPlans((prev) => prev.filter((p) => p.itinerary_id !== deleteTarget.itinerary_id));
    } catch {
      showToast({ variant: 'error', message: '일정 삭제에 실패했어요' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const renderPlanCard = (plan: ItinerarySummary, isPast: boolean) => (
    <Card
      key={plan.itinerary_id}
      className={[styles.card, isPast ? styles.pastCard : ''].filter(Boolean).join(' ')}
      title={plan.title ?? `${plan.region} 여행`}
      subtitle={`${plan.region} · ${formatDateRange(plan.start_date, plan.end_date)}`}
      onClick={() =>
        navigate(
          plan.status === 'DRAFT' ? `/place?iId=${plan.itinerary_id}` : `/plan/${plan.itinerary_id}`,
        )
      }
      badge={!isPast ? formatDday(plan.start_date, today) : undefined}
      onDelete={() => setDeleteTarget(plan)}
    />
  );

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        <Typography variant="h1" className={styles.title}>
          내 일정
        </Typography>

        {isLoading ? null : plans.length > 0 ? (
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
        description={
          deleteTarget ? `${deleteTarget.title ?? `${deleteTarget.region} 여행`} 일정이 삭제됩니다` : undefined
        }
        confirmLabel="삭제"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
