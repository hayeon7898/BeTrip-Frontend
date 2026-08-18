import { useEffect, useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header/Header';
import DayTabs from '../components/DayTabs/DayTabs';
import SearchBar from '../components/SearchBar/SearchBar';
import Typography from '../components/Typography/Typography';
import Button from '../components/Button/Button';
import PlaceListItem from '../components/PlaceListItem/PlaceListItem';
import PlaceDetailModal from '../components/Modal/PlaceDetailModal';
import KakaoMap from '../components/Map/KakaoMap';
import type { MapMarker } from '../components/Map/KakaoMap';
import { useToast } from '../components/Toast/useToast';
import type { Place } from '../types/place';
import { apiCategoryToUi } from '../types/place';
import {
  MEAL_SLOT_ORDER,
  MEAL_SLOT_LABEL,
  createEmptyDaySchedule,
} from '../types/plan';
import type { MealSlot, DaySchedule, ScheduleItem } from '../types/plan';
import { getItineraryDetail } from '../api/itineraries';
import type { ItineraryDetail, TimeSlot as ApiTimeSlot } from '../api/itineraries';
import { generatePlan, savePlan } from '../api/plan';
import { addPlaceToItinerary, removePlaceFromItinerary } from '../api/place';
import { searchPlaces } from '../api/map';
import { toApiClientError } from '../api/client';
import styles from './PlanPage.module.css';

const API_TO_MEAL_SLOT: Record<ApiTimeSlot, MealSlot> = {
  MORNING: 'morning',
  LUNCH: 'lunch',
  EVENING: 'dinner',
};

const MEAL_SLOT_TO_API: Record<MealSlot, ApiTimeSlot> = {
  morning: 'MORNING',
  lunch: 'LUNCH',
  dinner: 'EVENING',
};

function buildSchedulesFromDetail(detail: ItineraryDetail): {
  schedules: Record<number, DaySchedule>;
  totalDays: number;
} {
  const totalDays = detail.schedule?.days.length ?? 0;
  const schedules: Record<number, DaySchedule> = {};
  for (let day = 1; day <= totalDays; day += 1) {
    schedules[day] = createEmptyDaySchedule();
  }
  if (!detail.schedule) return { schedules, totalDays };

  const placeById = new Map(detail.places.map((place) => [place.place_id, place]));

  detail.schedule.days.forEach((dayData) => {
    dayData.items.forEach((apiItem) => {
      const placeInfo = placeById.get(apiItem.place_id);
      if (!placeInfo) return;
      const slot = API_TO_MEAL_SLOT[apiItem.time_slot];
      const item: ScheduleItem = {
        id: placeInfo.itinerary_place_id,
        time: apiItem.start_time ?? '',
        place: {
          id: placeInfo.place_id,
          name: apiItem.name,
          category: apiCategoryToUi(placeInfo.category),
          address: placeInfo.address ?? undefined,
          thumbnailUrl: placeInfo.thumbnail_url ?? undefined,
          latitude: placeInfo.lat,
          longitude: placeInfo.lng,
        },
        travelToNextMin: apiItem.travel_time_to_next_min ?? undefined,
        orderInDay: apiItem.order_in_day,
      };
      schedules[dayData.day][slot].push(item);
    });
  });

  return { schedules, totalDays };
}

export default function PlanPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [activeDay, setActiveDay] = useState(1);
  const [schedules, setSchedules] = useState<Record<number, DaySchedule>>({});
  // 담기/삭제 처리 중 재진입(중복 클릭) 방지 플래그
  const [isMutatingSchedule, setIsMutatingSchedule] = useState(false);

  const [mapSearchValue, setMapSearchValue] = useState('');
  const [mapResults, setMapResults] = useState<Place[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMapSearchLoading, setIsMapSearchLoading] = useState(false);
  // '+ OO 일정 더 추가하기'를 눌러 어느 시간대에 담을지 지정해둔 상태 (드래그 없이도 담을 수 있는 폴백 경로)
  const [pendingAddSlot, setPendingAddSlot] = useState<MealSlot | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<MealSlot | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isResultsOpen, setIsResultsOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/my', { replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        let detail = await getItineraryDetail(id);
        if (!detail.schedule) {
          // 방어 코드: PlacePage의 "일정 만들기"를 거치지 않고 URL로 직접 들어온 경우 등.
          const generated = await generatePlan(id);
          detail = { ...detail, status: generated.status, schedule: generated.schedule };
        }
        if (cancelled) return;
        const { schedules: loaded, totalDays: days } = buildSchedulesFromDetail(detail);
        if (days === 0) {
          showToast({ variant: 'info', message: '담긴 장소가 없어서 장소 담기 화면으로 이동할게요' });
          navigate(`/place?iId=${id}`, { replace: true });
          return;
        }
        setSchedules(loaded);
        setTotalDays(days);
        setActiveDay(1);
      } catch {
        if (cancelled) return;
        showToast({ variant: 'error', message: '일정을 불러오지 못했어요' });
        navigate('/my', { replace: true });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, navigate, showToast]);

  const daySchedule = schedules[activeDay] ?? createEmptyDaySchedule();

  const flatItems = useMemo(() => {
    const list: ScheduleItem[] = [];
    MEAL_SLOT_ORDER.forEach((slot) => list.push(...daySchedule[slot]));
    return list;
  }, [daySchedule]);

  // 담긴 순서(index)를 지도 핀 번호로, 실제 좌표를 마커 위치로 사용합니다.
  const mapMarkers: MapMarker[] = useMemo(
    () =>
      flatItems.map((item, index) => ({
        id: item.id,
        title: item.place.name,
        latitude: item.place.latitude,
        longitude: item.place.longitude,
        label: index + 1,
      })),
    [flatItems],
  );

  const handleMarkerClick = (scheduleItemIdClicked: string) => {
    const item = flatItems.find((i) => i.id === scheduleItemIdClicked);
    if (item) setSelectedPlace(item.place);
  };

  const handleMapSearchSubmit = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsResultsOpen(true);
    setIsMapSearchLoading(true);
    try {
      const results = await searchPlaces(trimmed);
      setMapResults(results);
      if (results.length === 0) {
        showToast({ variant: 'warning', message: `'${trimmed}'와(과) 일치하는 장소가 없어요` });
      }
    } catch (error) {
      const apiError = toApiClientError(error);
      setMapResults([]);
      showToast({
        variant: 'error',
        message: apiError.message ?? '검색에 실패했어요. 잠시 후 다시 시도해주세요',
      });
    } finally {
      setIsMapSearchLoading(false);
    }
  };

  // 담기/삭제 직후 상세를 다시 조회해 스케줄 전체를 갱신합니다.
  const refreshSchedules = async (currentDay: number) => {
    if (!id) return;
    const detail = await getItineraryDetail(id);
    const { schedules: loaded, totalDays: days } = buildSchedulesFromDetail(detail);
    setSchedules(loaded);
    setTotalDays(days);
    setActiveDay((prev) => (prev <= days ? prev : currentDay));
  };

  const addPlaceToSlot = async (place: Place, slot: MealSlot) => {
    if (!id) return;
    if (isMutatingSchedule) {
      showToast({ variant: 'warning', message: '처리 중이에요. 잠시만 기다려주세요' });
      return;
    }
    setIsMutatingSchedule(true);
    try {
      const day = activeDay;
      const daySchedule = schedules[day] ?? createEmptyDaySchedule();
      const slotItems = daySchedule[slot];
      // 배열 길이가 아니라 기존 orderInDay 최댓값+1로 계산 — 삭제로 생긴 gap 때문에
      // 배열 길이를 쓰면 살아남은 항목과 슬롯이 충돌해 409가 날 수 있음.
      const orderInDay =
        slotItems.length === 0 ? 1 : Math.max(...slotItems.map((i) => i.orderInDay)) + 1;
      const timeSlotApi = MEAL_SLOT_TO_API[slot];

      try {
        await addPlaceToItinerary(id, place.id, {
          day,
          time_slot: timeSlotApi,
          order_in_day: orderInDay,
        });
      } catch (error) {
        const apiError = toApiClientError(error);
        showToast({
          variant: 'error',
          message: apiError.message ?? '장소를 담지 못했어요. 잠시 후 다시 시도해주세요',
        });
        return;
      }

      try {
        await refreshSchedules(day);
      } catch {
        showToast({ variant: 'warning', message: '최신 일정을 불러오지 못했어요. 새로고침해주세요' });
        return;
      }
      showToast({ variant: 'info', message: `${place.name}을(를) ${MEAL_SLOT_LABEL[slot]} 일정에 담았어요` });
      setPendingAddSlot(null);
    } finally {
      setIsMutatingSchedule(false);
    }
  };

  const removeScheduleItem = async (itemId: string) => {
    if (!id) return;
    if (isMutatingSchedule) {
      showToast({ variant: 'warning', message: '처리 중이에요. 잠시만 기다려주세요' });
      return;
    }
    setIsMutatingSchedule(true);
    try {
      const day = activeDay;

      try {
        await removePlaceFromItinerary(id, itemId);
      } catch (error) {
        const apiError = toApiClientError(error);
        showToast({
          variant: 'error',
          message: apiError.message ?? '장소를 삭제하지 못했어요. 잠시 후 다시 시도해주세요',
        });
        return;
      }

      try {
        await refreshSchedules(day);
      } catch {
        showToast({ variant: 'warning', message: '최신 일정을 불러오지 못했어요. 새로고침해주세요' });
      }
    } finally {
      setIsMutatingSchedule(false);
    }
  };

  const handleResultAddClick = (place: Place) => {
    if (!pendingAddSlot) {
      showToast({ variant: 'warning', message: '먼저 담을 시간대의 "+ 일정 더 추가하기"를 눌러주세요' });
      return;
    }
    void addPlaceToSlot(place, pendingAddSlot);
  };

  const handleAddSlotClick = (slot: MealSlot) => {
    setPendingAddSlot(slot);
    showToast({ variant: 'info', message: `지도에서 장소를 검색해 ${MEAL_SLOT_LABEL[slot]}에 담아보세요` });
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, place: Place) => {
    event.dataTransfer.setData('application/json', JSON.stringify(place));
    event.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOverSlot = (event: DragEvent<HTMLDivElement>, slot: MealSlot) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDragOverSlot(slot);
  };

  const handleDropOnSlot = (event: DragEvent<HTMLDivElement>, slot: MealSlot) => {
    event.preventDefault();
    setDragOverSlot(null);
    const raw = event.dataTransfer.getData('application/json');
    if (!raw) return;
    try {
      const place: Place = JSON.parse(raw);
      void addPlaceToSlot(place, slot);
    } catch {
      // 드래그 데이터가 손상된 경우 무시합니다.
    }
  };

  const handleSavePlan = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      await savePlan(id);
      showToast({ variant: 'success', message: '일정이 저장되었습니다' });
    } catch {
      showToast({ variant: 'error', message: '일정 저장에 실패했어요. 잠시 후 다시 시도해주세요' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.main}>
          <Typography variant="body" color="secondary">
            일정을 불러오는 중이에요...
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.topBar}>
        <DayTabs totalDays={totalDays} activeDay={activeDay} onSelect={setActiveDay} />
        <Button variant="primary" size="md" onClick={handleSavePlan} disabled={isSaving}>
          {isSaving ? '저장 중...' : '일정 저장하기'}
        </Button>
      </div>

      <div className={styles.main}>
        <div className={styles.mapPanel}>
          <KakaoMap markers={mapMarkers} onMarkerClick={handleMarkerClick} className={styles.mapArea} />

          <div className={styles.mapSearchOverlay}>
            {isSearchOpen ? (
              <>
                <SearchBar
                  value={mapSearchValue}
                  onChange={setMapSearchValue}
                  onSubmit={handleMapSearchSubmit}
                  placeholder="장소 검색하기"
                  className={styles.mapSearchBar}
                  rightSlot={
                    <button
                      type="button"
                      className={styles.searchCloseButton}
                      onClick={() => setIsSearchOpen(false)}
                      aria-label="검색 닫기"
                    >
                      ×
                    </button>
                  }
                />

                {isResultsOpen && (
                  <div className={styles.mapResultsPanel}>
                    <div className={styles.mapResultsHeader}>
                      <Typography variant="caption" color="tertiary">
                        {isMapSearchLoading ? '검색 중...' : `검색 결과 ${mapResults.length}건`}
                      </Typography>
                      <button
                        type="button"
                        className={styles.mapResultsClose}
                        onClick={() => setIsResultsOpen(false)}
                        aria-label="검색 결과 닫기"
                      >
                        ×
                      </button>
                    </div>

                    {pendingAddSlot && !isMapSearchLoading && mapResults.length > 0 && (
                      <Typography variant="caption" color="secondary" className={styles.pendingHint}>
                        {MEAL_SLOT_LABEL[pendingAddSlot]}에 담을 장소를 골라주세요 — 드래그하거나 담기 버튼을 눌러보세요
                      </Typography>
                    )}

                    {isMapSearchLoading ? (
                      <div className={styles.mapResultsList}>
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className={styles.skeletonItem}>
                            <div className={styles.skeletonThumb} />
                            <div className={styles.skeletonLines}>
                              <div className={styles.skeletonLine} style={{ width: '55%' }} />
                              <div className={styles.skeletonLine} style={{ width: '35%' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : mapResults.length === 0 ? (
                      <div className={styles.mapResultsEmpty}>
                        <Typography variant="caption" color="tertiary">
                          검색 결과가 없어요
                        </Typography>
                      </div>
                    ) : (
                      <div className={styles.mapResultsList}>
                        {mapResults.map((place) => (
                          <div
                            key={place.id}
                            className={styles.draggableCard}
                            draggable
                            onDragStart={(event) => handleDragStart(event, place)}
                          >
                            <PlaceListItem
                              place={place}
                              variant="comfortable"
                              onAdd={handleResultAddClick}
                              onClick={setSelectedPlace}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                className={styles.searchToggleButton}
                onClick={() => setIsSearchOpen(true)}
                aria-label="장소 검색하기"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className={styles.schedulePanel}>
          {MEAL_SLOT_ORDER.map((slot, slotIndex) => {
            const items = daySchedule[slot];
            const prevSlot = slotIndex > 0 ? MEAL_SLOT_ORDER[slotIndex - 1] : null;
            const prevSlotLastItem = prevSlot ? daySchedule[prevSlot].at(-1) : undefined;
            const boundaryTravelMin =
              prevSlotLastItem && items.length > 0 ? prevSlotLastItem.travelToNextMin : undefined;
            return (
              <div key={slot} className={styles.slotSection}>
                <Typography variant="h3" className={styles.slotTitle}>
                  {MEAL_SLOT_LABEL[slot]}
                </Typography>

                <div
                  className={[styles.slotDropZone, dragOverSlot === slot ? styles.slotDropZoneActive : '']
                    .filter(Boolean)
                    .join(' ')}
                  onDragOver={(event) => handleDragOverSlot(event, slot)}
                  onDragLeave={() => setDragOverSlot((prev) => (prev === slot ? null : prev))}
                  onDrop={(event) => handleDropOnSlot(event, slot)}
                >
                  {boundaryTravelMin !== undefined && (
                    <div className={styles.travelDivider}>🚗 이동 {boundaryTravelMin}분</div>
                  )}
                  {items.map((item, index) => (
                    <div key={item.id}>
                      {index > 0 && items[index - 1].travelToNextMin !== undefined && (
                        <div className={styles.travelDivider}>
                          🚗 이동 {items[index - 1].travelToNextMin}분
                        </div>
                      )}
                      <PlaceListItem
                        place={item.place}
                        time={item.time}
                        onClick={setSelectedPlace}
                        onRemove={() => void removeScheduleItem(item.id)}
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    className={styles.addSlotButton}
                    onClick={() => handleAddSlotClick(slot)}
                  >
                    + {MEAL_SLOT_LABEL[slot]} 일정 더 추가하기
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PlaceDetailModal
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
        onAdd={(place) => {
          if (!pendingAddSlot) {
            showToast({ variant: 'warning', message: '먼저 담을 시간대의 "+ 일정 더 추가하기"를 눌러주세요' });
            return;
          }
          void addPlaceToSlot(place, pendingAddSlot);
          setSelectedPlace(null);
        }}
      />
    </div>
  );
}
