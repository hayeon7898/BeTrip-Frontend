import { useEffect, useState } from 'react';

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY as string | undefined;

let loadingPromise: Promise<void> | null = null;

function loadKakaoMapScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('브라우저 환경이 아닙니다.'));
  }
  if (window.kakao?.maps) {
    return Promise.resolve();
  }
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    if (!KAKAO_MAP_KEY) {
      reject(
        new Error(
          'VITE_KAKAO_MAP_KEY가 설정되지 않았어요. .env에 카카오맵 JavaScript 키를 추가해주세요.',
        ),
      );
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => {
      loadingPromise = null;
      reject(new Error('카카오맵 스크립트 로드에 실패했어요.'));
    };
    document.head.appendChild(script);
  });

  return loadingPromise;
}

export function useKakaoMapScript() {
  const [isLoaded, setIsLoaded] = useState(() => Boolean(window.kakao?.maps));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded) return;
    let cancelled = false;

    loadKakaoMapScript()
      .then(() => {
        if (!cancelled) setIsLoaded(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isLoaded, error };
}