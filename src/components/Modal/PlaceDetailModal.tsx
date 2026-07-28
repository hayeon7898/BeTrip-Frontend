import Typography from '../Typography/Typography';
import Button from '../Button/Button';
import styles from './PlaceDetailModal.module.css';
import type { Place } from '../../types/place';
import { CATEGORY_LABEL } from '../../types/place';

interface PlaceDetailModalProps {
  place: Place | null;
  added?: boolean;
  onClose: () => void;
  onAdd?: (place: Place) => void;
}

// 참고: 프로젝트에 이미 오버레이/포털 로직을 가진 공통 Modal 베이스 컴포넌트가 있다면
// (ConfirmModal이 사용 중인 그 컴포넌트) 이 컴포넌트도 그걸 감싸서 만드는 게 더 일관적입니다.
// 여기서는 해당 컴포넌트의 실제 구현을 알 수 없어 오버레이를 자체적으로 구현했습니다.
export default function PlaceDetailModal({ place, added = false, onClose, onAdd }: PlaceDetailModalProps) {
  if (!place) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.panel}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${place.name} 상세정보`}
      >
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="닫기">
          ×
        </button>

        <div className={styles.photoRow}>
          {place.photos.length > 0 ? (
            place.photos.map((photo, index) => (
              <img
                key={photo}
                src={photo}
                alt={`${place.name} 사진 ${index + 1}`}
                className={styles.photo}
              />
            ))
          ) : (
            <div className={styles.photoPlaceholder}>
              <Typography variant="caption" color="tertiary">
                사진 준비중
              </Typography>
            </div>
          )}
        </div>

        <div className={styles.header}>
          <Typography variant="h2">{place.name}</Typography>
          <Typography variant="caption" color="secondary" className={styles.headerMeta}>
            {CATEGORY_LABEL[place.category]} · {place.rating.toFixed(1)} · {place.tags.join(' · ')} ·{' '}
            {place.priceLabel}
          </Typography>
        </div>

        <div className={styles.section}>
          <Typography variant="h3" className={styles.sectionTitle}>
            메뉴 요약
          </Typography>
          <ul className={styles.menuList}>
            {place.menuSummary.map((menu) => (
              <li key={menu}>
                <Typography variant="body" color="secondary">
                  {menu}
                </Typography>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <Typography variant="h3" className={styles.sectionTitle}>
            리뷰 요약
          </Typography>
          <Typography variant="body" color="secondary">
            {place.reviewSummary}
          </Typography>
        </div>

        <Button
          variant={added ? 'secondary' : 'primary'}
          size="lg"
          className={styles.addButton}
          onClick={() => onAdd?.(place)}
          disabled={added}
        >
          {added ? '담김' : '일정에 담기'}
        </Button>
      </div>
    </div>
  );
}