import Typography from '../Typography/Typography';
import Button from '../Button/Button';
import styles from './PlaceListItem.module.css';
import type { Place } from '../../types/place';

interface PlaceListItemProps {
  place: Place;
  /** 일정 화면(PlanPage)처럼 시간이 있는 리스트에서 사용. 없으면 시간 라벨을 표시하지 않습니다. */
  time?: string;
  /** compact(기본): 담은 장소 목록/일정용, 촘촘한 스타일. comfortable: 검색 결과처럼 사진 크게, 여유있게. */
  variant?: 'compact' | 'comfortable';
  onClick?: (place: Place) => void;
  onRemove?: (place: Place) => void;
  /** 있으면 우측에 "담기" 버튼이 표시됩니다 (검색 결과에서 빠르게 담을 때 사용). */
  onAdd?: (place: Place) => void;
}

export default function PlaceListItem({
  place,
  time,
  variant = 'compact',
  onClick,
  onRemove,
  onAdd,
}: PlaceListItemProps) {
  const isComfortable = variant === 'comfortable';

  return (
    <div className={[styles.item, isComfortable && styles.itemComfortable].filter(Boolean).join(' ')}>
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
        {place.thumbnailUrl ? (
          <img
            src={place.thumbnailUrl}
            alt={place.name}
            className={[styles.thumb, isComfortable && styles.thumbComfortable]
              .filter(Boolean)
              .join(' ')}
          />
        ) : (
          <div
            className={[styles.thumbPlaceholder, isComfortable && styles.thumbComfortable]
              .filter(Boolean)
              .join(' ')}
          />
        )}
        <div className={styles.text}>
          <Typography variant={isComfortable ? 'h3' : 'body'} className={styles.name}>
            {place.name}
          </Typography>
          <Typography
            variant="caption"
            color="tertiary"
            className={isComfortable ? styles.addressComfortable : undefined}
          >
            {place.address ?? '주소 정보 없음'}
          </Typography>
        </div>
      </button>

      {onAdd && (
        <Button
          variant="primary"
          size="sm"
          className={styles.addButton}
          onClick={() => onAdd(place)}
        >
          담기
        </Button>
      )}

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