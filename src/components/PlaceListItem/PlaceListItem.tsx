import Typography from '../Typography/Typography';
import styles from './PlaceListItem.module.css';
import type { Place } from '../../types/place';

interface PlaceListItemProps {
  place: Place;
  /** 일정 화면(PlanPage)처럼 시간이 있는 리스트에서 사용. 없으면 시간 라벨을 표시하지 않습니다. */
  time?: string;
  onClick?: (place: Place) => void;
  onRemove?: (place: Place) => void;
}

export default function PlaceListItem({ place, time, onClick, onRemove }: PlaceListItemProps) {
  return (
    <div className={styles.item}>
      {time && (
        <Typography variant="body" className={styles.time}>
          {time}
        </Typography>
      )}
      <button
        type="button"
        className={styles.main}
        onClick={() => onClick?.(place)}
        aria-label={`${place.name} 상세정보 보기`}
      >
        {place.image ? (
          <img src={place.image} alt={place.name} className={styles.thumb} />
        ) : (
          <div className={styles.thumbPlaceholder} />
        )}
        <div className={styles.text}>
          <Typography variant="body" className={styles.name}>
            {place.name}
          </Typography>
          <Typography variant="caption" color="tertiary">
            {place.rating.toFixed(1)} · {place.priceLabel}
          </Typography>
        </div>
      </button>

      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={() => onRemove(place)}
          aria-label={`${place.name} 목록에서 삭제`}
        >
          ×
        </button>
      )}
    </div>
  );
}