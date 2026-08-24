import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { useKakaoMapScript } from '../../hooks/useKakaoMapScript';
import Typography from '../Typography/Typography';
import styles from './KakaoMap.module.css';

export interface MapMarker {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  /** 핀 위에 표시할 번호 (일정 순서 등). variant가 'sub'면 표시하지 않음 */
  label: number;
  /** 'main'(기본): 번호 배지가 있는 일정 핀. 'sub': 번호 없는 작은 임시 핀(검색 결과 미리보기 등) */
  variant?: 'main' | 'sub';
}

export interface KakaoMapInfoWindow {
  latitude: number;
  longitude: number;
  content: ReactNode;
}

interface KakaoMapProps {
  markers: MapMarker[];
  onMarkerClick?: (id: string) => void;
  className?: string;
  /** 특정 좌표 위에 임의의 React 콘텐츠(인포윈도우 카드 등)를 앵커링해서 띄웁니다 */
  infoWindow?: KakaoMapInfoWindow | null;
}

// 마커가 없을 때 보여줄 기본 중심 좌표 (서울 시청)
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

// 어떤 마커를 클릭해도 인포윈도우 카드(핀 위로 뜸)가 지도 패널 위쪽 바깥으로 잘리지 않도록,
// fitBounds 시 항상 위쪽에 카드 높이만큼 여백을 둡니다.
const INFO_WINDOW_TOP_PADDING = 170;

export default function KakaoMap({ markers, onMarkerClick, className, infoWindow }: KakaoMapProps) {
  const { isLoaded, error } = useKakaoMapScript();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const overlaysRef = useRef<KakaoCustomOverlay[]>([]);
  const infoWindowOverlayRef = useRef<KakaoCustomOverlay | null>(null);
  // 카카오 CustomOverlay의 content로 등록해둘 빈 div — 실제 내용은 React portal로 그 안에 렌더링합니다.
  // (렌더 중 ref.current를 읽고 쓰는 대신, 최초 1회만 만들어지는 state 값으로 관리합니다.)
  const [infoWindowContainer] = useState(() => document.createElement('div'));

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

      const isSub = marker.variant === 'sub';
      const content = document.createElement('div');
      content.className = isSub ? styles.pinSub : styles.pin;
      if (!isSub) content.textContent = String(marker.label);
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

    map.setBounds(bounds, INFO_WINDOW_TOP_PADDING, 24, 24, 24);
  }, [isLoaded, markers, onMarkerClick]);

  // infoWindow가 바뀔 때마다 카카오 CustomOverlay를 만들거나 위치만 옮깁니다.
  // 실제 내용(React 콘텐츠)은 아래 render의 portal이 이 overlay의 content div에 그려줍니다.
  useEffect(() => {
    const map = mapRef.current;
    if (!isLoaded || !map) return;
    const { kakao } = window;

    if (!infoWindow) {
      infoWindowOverlayRef.current?.setMap(null);
      infoWindowOverlayRef.current = null;
      return;
    }

    const position = new kakao.maps.LatLng(infoWindow.latitude, infoWindow.longitude);

    if (infoWindowOverlayRef.current) {
      // 같은 overlay(=같은 content div)를 재사용해서 이동만 시킵니다
      infoWindowOverlayRef.current.setPosition(position);
      return;
    }

    const overlay = new kakao.maps.CustomOverlay({
      position,
      content: infoWindowContainer,
      xAnchor: 0.5,
      yAnchor: 1,
      zIndex: 20,
    });
    overlay.setMap(map);
    infoWindowOverlayRef.current = overlay;
    // 좌표(lat/lng)가 실제로 바뀔 때만 재실행 되도록
  }, [isLoaded, infoWindow?.latitude, infoWindow?.longitude]);

  useEffect(() => {
    return () => {
      infoWindowOverlayRef.current?.setMap(null);
    };
  }, []);

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

      {infoWindow && createPortal(infoWindow.content, infoWindowContainer)}
    </div>
  );
}