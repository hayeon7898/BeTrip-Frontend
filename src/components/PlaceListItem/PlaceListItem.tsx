import { useState } from 'react';
import Typography from '../Typography/Typography';
import Button from '../Button/Button';
import styles from './PlaceListItem.module.css';
import type { Place } from '../../types/place';

interface PlaceListItemProps {
  place: Place;
  time?: string;
  variant?: 'compact' | 'comfortable';
  onClick?: (place: Place) => void;
  onRemove?: (place: Place) => void;
  onAdd?: (place: Place) => void;
}

function normalizeImageUrl(url: string): string {
  return url.startsWith('//') ? `https:${url}` : url;
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
  const [imgError, setImgError] = useState(false);

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
        {place.thumbnailUrl && !imgError ? (
          <img
            src={normalizeImageUrl(place.thumbnailUrl)}
            alt={place.name}
            className={[styles.thumb, isComfortable && styles.thumbComfortable]
              .filter(Boolean)
              .join(' ')}
            onError={() => setImgError(true)}
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