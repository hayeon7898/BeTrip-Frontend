import { useEffect, useRef } from 'react';
import { useKakaoMapScript } from '../../hooks/useKakaoMapScript';
import Typography from '../Typography/Typography';
import styles from './KakaoMap.module.css';

export interface MapMarker {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  /** 핀 위에 표시할 번호 (일정 순서 등) */
  label: number;
}

interface KakaoMapProps {
  markers: MapMarker[];
  onMarkerClick?: (id: string) => void;
  className?: string;
}

// 마커가 없을 때 보여줄 기본 중심 좌표 (서울 시청)
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export default function KakaoMap({ markers, onMarkerClick, className }: KakaoMapProps) {
  const { isLoaded, error } = useKakaoMapScript();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const overlaysRef = useRef<KakaoCustomOverlay[]>([]);

  // 지도 인스턴스는 최초 1회만 생성합니다.
  useEffect(() => {
    if (!isLoaded || !containerRef.current || mapRef.current) return;
    const { kakao } = window;
    mapRef.current = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      level: 6,
    });
  }, [isLoaded]);

  // 부모 패널 크기가 바뀌어도(반응형 등) 지도가 올바르게 다시 그려지도록 처리합니다.
  useEffect(() => {
    if (!isLoaded) return;
    const handleResize = () => mapRef.current?.relayout();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoaded]);

  // markers가 바뀔 때마다 기존 오버레이(핀)를 지우고 다시 그립니다.
  useEffect(() => {
    const map = mapRef.current;
    if (!isLoaded || !map) return;
    const { kakao } = window;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    if (markers.length === 0) return;

    const bounds = new kakao.maps.LatLngBounds();

    markers.forEach((marker) => {
      const position = new kakao.maps.LatLng(marker.latitude, marker.longitude);
      bounds.extend(position);

      const content = document.createElement('div');
      content.className = styles.pin;
      content.textContent = String(marker.label);
      content.title = marker.title;
      if (onMarkerClick) {
        content.style.cursor = 'pointer';
        content.addEventListener('click', () => onMarkerClick(marker.id));
      }

      const overlay = new kakao.maps.CustomOverlay({
        position,
        content,
        yAnchor: 1,
      });
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });

    map.setBounds(bounds);
  }, [isLoaded, markers, onMarkerClick]);

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      <div ref={containerRef} className={styles.map} />

      {(!isLoaded || error) && (
        <div className={styles.placeholder}>
          <Typography variant="caption" color="tertiary">
            {error ?? '지도를 불러오는 중이에요'}
          </Typography>
        </div>
      )}
    </div>
  );
}