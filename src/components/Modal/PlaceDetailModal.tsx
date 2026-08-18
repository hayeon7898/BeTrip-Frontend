import { useEffect, useState } from 'react';
import Typography from '../Typography/Typography';
import Button from '../Button/Button';
import styles from './PlaceDetailModal.module.css';
import type { Place } from '../../types/place';
import { CATEGORY_LABEL } from '../../types/place';
import { getPlaceDetail } from '../../api/map';

interface PlaceDetailModalProps {
  place: Place | null;
  added?: boolean;
  onClose: () => void;
  onAdd?: (place: Place) => void;
}

export default function PlaceDetailModal({ place, added = false, onClose, onAdd }: PlaceDetailModalProps) {
  const [placeUrl, setPlaceUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  useEffect(() => {
    if (!place) return;

    let cancelled = false;

    const loadPlaceUrl = async () => {
      setIsLoadingUrl(true);
      setPlaceUrl(null);

      try {
        const detail = await getPlaceDetail(place.id);
        if (!cancelled) setPlaceUrl(detail.placeUrl);
      } catch {
        if (!cancelled) setPlaceUrl(null);
      } finally {
        if (!cancelled) setIsLoadingUrl(false);
      }
    };

    loadPlaceUrl();

    return () => {
      cancelled = true;
    };
  }, [place]);

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
          {place.thumbnailUrl ? (
            <img src={place.thumbnailUrl} alt={place.name} className={styles.photo} />
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
            {CATEGORY_LABEL[place.category]}
            {place.address ? ` · ${place.address}` : ''}
          </Typography>
        </div>

        <div className={styles.actionRow}>
          <Button
            variant="secondary"
            size="lg"
            className={styles.mapLinkButton}
            disabled={isLoadingUrl || !placeUrl}
            onClick={() => placeUrl && window.open(placeUrl, '_blank', 'noopener,noreferrer')}
          >
            {isLoadingUrl ? '불러오는 중...' : '카카오맵에서 보기'}
          </Button>

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
    </div>
  );
}