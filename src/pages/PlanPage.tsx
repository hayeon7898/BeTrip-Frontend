import { useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import Header from '../components/Header/Header';
import DayTabs from '../components/DayTabs/DayTabs';
import SearchBar from '../components/SearchBar/SearchBar';
import Typography from '../components/Typography/Typography';
import Button from '../components/Button/Button';
import PlaceCard from '../components/PlaceCard/PlaceCard';
import PlaceListItem from '../components/PlaceListItem/PlaceListItem';
import PlaceDetailModal from '../components/Modal/PlaceDetailModal';
import KakaoMap from '../components/Map/KakaoMap';
import type { MapMarker } from '../components/Map/KakaoMap';
import { useToast } from '../components/Toast/useToast';
import { MOCK_PLACES } from '../mocks/PlanMockData';
import type { Place } from '../types/place';
import {
  MEAL_SLOT_ORDER,
  MEAL_SLOT_LABEL,
  createEmptyDaySchedule,
} from '../types/plan';
import type { MealSlot, DaySchedule, ScheduleItem } from '../types/plan';
import styles from './PlanPage.module.css';

// 데모 고정값입니다. 실제로는 일정 생성 단계(기간 입력)에서 정해진 여행 일수를 받아와야 해요.
const TOTAL_DAYS = 4;

const SLOT_START_TIME: Record<MealSlot, string> = {
  morning: '08:00',
  lunch: '12:00',
  dinner: '18:00',
};

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor((((total % (24 * 60)) + 24 * 60) % (24 * 60)) / 60);
  const mm = ((total % 60) + 60) % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// 이미 담긴 항목 수를 기준으로 슬롯 시작 시간에서 90분씩 밀어 자동 배정합니다.
function nextTimeForSlot(slot: MealSlot, existingCount: number) {
  return addMinutes(SLOT_START_TIME[slot], existingCount * 90);
}

// 실제 경로 API 연동 전까지 쓰는 더미 이동시간(문자열 시드 기반이라 항상 같은 값이 나와요).
function dummyTravelMinutes(fromId: string, toId: string) {
  const seed = `${fromId}${toId}`.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return 8 + (seed % 20);
}

let scheduleItemId = 0;
const nextScheduleItemId = () => `sch-${++scheduleItemId}`;

export default function PlanPage() {
  const { showToast } = useToast();

  const [activeDay, setActiveDay] = useState(1);
  const [schedules, setSchedules] = useState<Record<number, DaySchedule>>(() => {
    const initial: Record<number, DaySchedule> = {};
    for (let day = 1; day <= TOTAL_DAYS; day += 1) {
      initial[day] = createEmptyDaySchedule();
    }
    return initial;
  });

  const [mapSearchValue, setMapSearchValue] = useState('');
  const [mapResults, setMapResults] = useState<Place[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // '+ OO 일정 더 추가하기'를 눌러 어느 시간대에 담을지 지정해둔 상태 (드래그 없이도 담을 수 있는 폴백 경로)
  const [pendingAddSlot, setPendingAddSlot] = useState<MealSlot | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<MealSlot | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const daySchedule = schedules[activeDay];

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

  const handleMapSearchSubmit = (query: string) => {
    const results = MOCK_PLACES.filter(
      (place) => place.name.includes(query) || place.tags.some((tag) => tag.includes(query)),
    );
    setMapResults(results);
    if (results.length === 0) {
      showToast({ variant: 'warning', message: `'${query}'와(과) 일치하는 장소가 없어요` });
    }
  };

  const addPlaceToSlot = (place: Place, slot: MealSlot) => {
    setSchedules((prev) => {
      const day = prev[activeDay];
      const item: ScheduleItem = {
        id: nextScheduleItemId(),
        time: nextTimeForSlot(slot, day[slot].length),
        place,
      };
      return { ...prev, [activeDay]: { ...day, [slot]: [...day[slot], item] } };
    });
    showToast({ variant: 'info', message: `${place.name}을(를) ${MEAL_SLOT_LABEL[slot]} 일정에 담았어요` });
    setPendingAddSlot(null);
  };

  const removeScheduleItem = (slot: MealSlot, itemId: string) => {
    setSchedules((prev) => ({
      ...prev,
      [activeDay]: { ...prev[activeDay], [slot]: prev[activeDay][slot].filter((i) => i.id !== itemId) },
    }));
  };

  const handleResultAddClick = (place: Place) => {
    if (!pendingAddSlot) {
      showToast({ variant: 'warning', message: '먼저 담을 시간대의 "+ 일정 더 추가하기"를 눌러주세요' });
      return;
    }
    addPlaceToSlot(place, pendingAddSlot);
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
      addPlaceToSlot(place, slot);
    } catch {
      // 드래그 데이터가 손상된 경우 무시합니다.
    }
  };

  const handleSavePlan = () => {
    showToast({ variant: 'success', message: '일정이 저장되었습니다' });
  };

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.topBar}>
        <DayTabs totalDays={TOTAL_DAYS} activeDay={activeDay} onSelect={setActiveDay} />
        <Button variant="primary" size="md" onClick={handleSavePlan}>
          일정 저장하기
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

                {mapResults.length > 0 && (
                  <div className={styles.mapResultsPanel}>
                    {pendingAddSlot && (
                      <Typography variant="caption" color="secondary" className={styles.pendingHint}>
                        {MEAL_SLOT_LABEL[pendingAddSlot]}에 담을 장소를 골라주세요 — 드래그하거나 담기 버튼을 눌러보세요
                      </Typography>
                    )}
                    <div className={styles.mapResultsList}>
                      {mapResults.map((place) => (
                        <div
                          key={place.id}
                          className={styles.draggableCard}
                          draggable
                          onDragStart={(event) => handleDragStart(event, place)}
                        >
                          <PlaceCard place={place} onAdd={handleResultAddClick} onClick={setSelectedPlace} />
                        </div>
                      ))}
                    </div>
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
          {MEAL_SLOT_ORDER.map((slot) => {
            const items = daySchedule[slot];
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
                  {items.map((item, index) => (
                    <div key={item.id}>
                      {index > 0 && (
                        <div className={styles.travelDivider}>
                          🚗 이동 {dummyTravelMinutes(items[index - 1].place.id, item.place.id)}분
                        </div>
                      )}
                      <PlaceListItem
                        place={item.place}
                        time={item.time}
                        onClick={setSelectedPlace}
                        onRemove={() => removeScheduleItem(slot, item.id)}
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
          addPlaceToSlot(place, pendingAddSlot);
          setSelectedPlace(null);
        }}
      />
    </div>
  );
}