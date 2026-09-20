import { useState, type MouseEvent } from 'react';
import Typography from '../Typography/Typography';
import Button from '../Button/Button';
import styles from './PlaceCard.module.css';
import type { Place } from '../../types/place';

interface PlaceCardProps {
  place: Place;
  added?: boolean;
  onAdd?: (place: Place) => void;
  onClick?: (place: Place) => void;
}

function normalizeImageUrl(url: string): string {
  return url.startsWith('//') ? `https:${url}` : url;
}

export default function PlaceCard({ place, added = false, onAdd, onClick }: PlaceCardProps) {
  const [imgError, setImgError] = useState(false);

  const handleAddClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onAdd?.(place);
  };

  return (
    <div className={styles.card}>
      <button
        type="button"
        className={styles.thumbnailButton}
        onClick={() => onClick?.(place)}
        aria-label={`${place.name} 상세정보 보기`}
      >
        {place.thumbnailUrl && !imgError ? (
          <img
            src={normalizeImageUrl(place.thumbnailUrl)}
            alt={place.name}
            className={styles.thumbnail}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.thumbnailPlaceholder}>
            <Typography variant="caption" color="tertiary">
              사진 준비중
            </Typography>
          </div>
        )}
      </button>

      <button
        type="button"
        className={styles.info}
        onClick={() => onClick?.(place)}
        aria-label={`${place.name} 상세정보 보기`}
      >
        <Typography variant="h3" className={styles.name}>
          {place.name}
        </Typography>
        <Typography variant="caption" color="secondary" className={styles.meta}>
          {place.address ?? '주소 정보 없음'}
        </Typography>
      </button>

      <Button
        variant={added ? 'secondary' : 'outline'}
        size="sm"
        className={styles.addButton}
        onClick={handleAddClick}
        disabled={added}
      >
        {added ? '담김' : '담기 +'}
      </Button>
    </div>
  );
}