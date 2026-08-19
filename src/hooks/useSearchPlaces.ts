import { useCallback, useEffect, useRef, useState } from 'react';
import type { Place } from '../types/place';
import { searchPlaces } from '../api/map';
import { toApiClientError } from '../api/client';

interface UseSearchPlacesOptions {
  onError?: (message: string) => void;
}

interface UseSearchPlacesResult {
  results: Place[];
  hasNext: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  // 새 검색어로 첫 페이지를 조회한다. 직전과 같은 검색어면 재요청하지 않고 기존 결과를 그대로 반환한다.
  search: (query: string) => Promise<Place[]>;
  reset: () => void;
  containerRef: (node: HTMLDivElement | null) => void;
  sentinelRef: (node: HTMLDivElement | null) => void;
}

export function useSearchPlaces(options: UseSearchPlacesOptions = {}): UseSearchPlacesResult {
  // onError는 ref로 최신값만 추적해 search/loadMore와 Observer 관련 함수의 identity를 안정화한다.
  const onErrorRef = useRef(options.onError);
  useEffect(() => {
    onErrorRef.current = options.onError;
  });

  const [results, setResults] = useState<Place[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 비동기 조율용 상태관리용 ref
  const queryRef = useRef('');
  const pageRef = useRef(1);
  const hasNextRef = useRef(false);
  const hasSearchedRef = useRef(false);
  const resultsRef = useRef<Place[]>([]);
  const isFetchingMoreRef = useRef(false);
  const requestIdRef = useRef(0);

  const search = useCallback(
    async (query: string): Promise<Place[]> => {
      const trimmed = query.trim();
      if (!trimmed) return resultsRef.current;

      // 직전과 같은 검색어면 재요청하지 않는다
      if (trimmed === queryRef.current && hasSearchedRef.current) {
        return resultsRef.current;
      }

      const requestId = ++requestIdRef.current;
      queryRef.current = trimmed;
      pageRef.current = 1;
      hasSearchedRef.current = true;
      setIsLoading(true);

      try {
        const { places, hasNext: nextFlag } = await searchPlaces(trimmed, 1);
        if (requestId !== requestIdRef.current) return resultsRef.current;

        resultsRef.current = places;
        hasNextRef.current = nextFlag;
        setResults(places);
        setHasNext(nextFlag);
        return places;
      } catch (err) {
        if (requestId !== requestIdRef.current) return resultsRef.current;

        resultsRef.current = [];
        hasNextRef.current = false;
        setResults([]);
        setHasNext(false);
        onErrorRef.current?.(
          toApiClientError(err).message ?? '검색에 실패했어요. 잠시 후 다시 시도해주세요.',
        );
        return [];
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    },
    [],
  );

  const loadMore = useCallback(async () => {
    if (isFetchingMoreRef.current || !hasNextRef.current || !queryRef.current) return;

    isFetchingMoreRef.current = true;
    setIsLoadingMore(true);
    const requestId = ++requestIdRef.current;
    const nextPage = pageRef.current + 1;

    try {
      const { places, hasNext: nextFlag } = await searchPlaces(queryRef.current, nextPage);
      if (requestId !== requestIdRef.current) return;

      const existingIds = new Set(resultsRef.current.map((place) => place.id));
      const merged = [...resultsRef.current, ...places.filter((place) => !existingIds.has(place.id))];

      resultsRef.current = merged;
      hasNextRef.current = nextFlag;
      pageRef.current = nextPage;
      setResults(merged);
      setHasNext(nextFlag);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      // 기존 결과/hasNext는 그대로 둔다 - 다음 스크롤 때 같은 페이지로 재시도됨
      onErrorRef.current?.(toApiClientError(err).message ?? '추가 결과를 불러오지 못했어요.');
    } finally {
      isFetchingMoreRef.current = false;
      if (requestId === requestIdRef.current) setIsLoadingMore(false);
    }
  }, []);

  const reset = useCallback(() => {
    ++requestIdRef.current;
    queryRef.current = '';
    pageRef.current = 1;
    hasNextRef.current = false;
    hasSearchedRef.current = false;
    resultsRef.current = [];
    isFetchingMoreRef.current = false;
    setResults([]);
    setHasNext(false);
    setIsLoading(false);
    setIsLoadingMore(false);
  }, []);

  // IntersectionObserver는 containerRef/sentinelRef 콜백 ref가 둘 다 붙었을 때만 생성한다.
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerNodeRef = useRef<HTMLDivElement | null>(null);
  const sentinelNodeRef = useRef<HTMLDivElement | null>(null);

  const trySetupObserver = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!containerNodeRef.current || !sentinelNodeRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { root: containerNodeRef.current, rootMargin: '200px' },
    );
    observer.observe(sentinelNodeRef.current);
    observerRef.current = observer;
  }, [loadMore]);

  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerNodeRef.current = node;
      trySetupObserver();
    },
    [trySetupObserver],
  );

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      sentinelNodeRef.current = node;
      trySetupObserver();
    },
    [trySetupObserver],
  );

  return {
    results,
    hasNext,
    isLoading,
    isLoadingMore,
    search,
    reset,
    containerRef,
    sentinelRef,
  };
}
