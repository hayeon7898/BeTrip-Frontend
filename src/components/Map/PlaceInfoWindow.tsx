import { useEffect, useState } from 'react';
import Typography from '../Typography/Typography';
import Button from '../Button/Button';
import styles from './PlaceInfoWindow.module.css';
import type { Place } from '../../types/place';
import { CATEGORY_LABEL } from '../../types/place';
import { getPlaceDetail } from '../../api/map';

interface PlaceInfoWindowProps {
  place: Place;
  added?: boolean;
  onClose: () => void;
  onAdd?: (place: Place) => void;
}

export default function PlaceInfoWindow({ place, added = false, onClose, onAdd }: PlaceInfoWindowProps) {
  const [placeUrl, setPlaceUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  useEffect(() => {
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
  }, [place.id]);

  return (
    <div className={styles.card} onClick={(event) => event.stopPropagation()}>
      <button type="button" className={styles.closeButton} onClick={onClose} aria-label="닫기">
        ×
      </button>

      <div className={styles.body}>
        {place.thumbnailUrl ? (
          <img src={place.thumbnailUrl} alt={place.name} className={styles.thumb} />
        ) : (
          <div className={styles.thumbPlaceholder} />
        )}

        <div className={styles.text}>
          <Typography variant="body" className={styles.name}>
            {place.name}
          </Typography>
          <Typography variant="caption" color="secondary" className={styles.meta}>
            {CATEGORY_LABEL[place.category]}
            {place.address ? ` · ${place.address}` : ''}
          </Typography>
        </div>
      </div>

      <div className={styles.actionRow}>
        <Button
          variant="secondary"
          size="sm"
          className={styles.mapLinkButton}
          disabled={isLoadingUrl || !placeUrl}
          onClick={() => placeUrl && window.open(placeUrl, '_blank', 'noopener,noreferrer')}
        >
          {isLoadingUrl ? '불러오는 중...' : '카카오맵에서 보기'}
        </Button>

        <Button
          variant={added ? 'secondary' : 'primary'}
          size="sm"
          className={styles.addButton}
          onClick={() => onAdd?.(place)}
          disabled={added}
        >
          {added ? '담김' : '담기'}
        </Button>
      </div>

      <div className={styles.tail} />
    </div>
  );
}
