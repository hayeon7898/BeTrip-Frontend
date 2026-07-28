import type { MouseEvent } from 'react';
import Typography from '../Typography/Typography';
import Button from '../Button/Button';
import styles from './PlaceCard.module.css';
import type { Place } from '../../types/place';

interface PlaceCardProps {
  place: Place;
  /** 이미 내 카테고리 리스트에 담긴 상태인지 */
  added?: boolean;
  /** '담기 +' 버튼 클릭 */
  onAdd?: (place: Place) => void;
  /** 카드(썸네일/이름) 클릭 → 상세정보 열기 */
  onClick?: (place: Place) => void;
}

export default function PlaceCard({ place, added = false, onAdd, onClick }: PlaceCardProps) {
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
        {place.image ? (
          <img src={place.image} alt={place.name} className={styles.thumbnail} />
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
          {place.rating.toFixed(1)} · {place.tags.join(' · ')} · {place.priceLabel}
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