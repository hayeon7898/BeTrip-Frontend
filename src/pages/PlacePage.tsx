import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import SearchBar from '../components/SearchBar/SearchBar';
import Typography from '../components/Typography/Typography';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import PlaceCard from '../components/PlaceCard/PlaceCard';
import PlaceListItem from '../components/PlaceListItem/PlaceListItem';
import PlaceDetailModal from '../components/Modal/PlaceDetailModal';
import { useToast } from '../components/Toast/useToast';
import { CATEGORY_LABEL, CATEGORY_ORDER, uiCategoryToApi } from '../types/place';
import type { Place, PlaceCategory } from '../types/place';
import { recommendPlaces, addPlaceToItinerary, removePlaceFromItinerary } from '../api/place';
import { searchPlaces } from '../api/map';
import { generatePlan } from '../api/plan';
import { toApiClientError } from '../api/client';
import styles from './PlacePage.module.css';

type ChatMessage =
  | { id: string; role: 'ai' | 'user'; kind: 'text'; text: string }
  | { id: string; role: 'ai'; kind: 'places'; places: Place[] };

let messageId = 0;
const nextId = () => `msg-${++messageId}`;

// 채팅 텍스트에서 카테고리를 추정한다. recommend API가 키워드 검색은
// 지원하지 않고 region/category 필터만 지원하기 때문에, 자유 텍스트를
// 그대로 보내는 대신 카테고리로 변환해서 넘긴다.
function detectCategory(text: string): PlaceCategory | undefined {
  if (/카페|커피|디저트/.test(text)) return 'cafe';
  if (/액티비티|체험|산책|투어/.test(text)) return 'activity';
  if (/식당|맛집|저녁|점심|다이닝/.test(text)) return 'restaurant';
  return undefined;
}

export default function PlacePage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itineraryId = searchParams.get('iId') ?? '';

  // ---- 채팅(AI 추천) ----
  const [chatValue, setChatValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), role: 'ai', kind: 'text', text: '어떤 여행 스타일을 원하세요?' },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ---- 검색(지도 검색, 채팅과 완전히 별개) ----
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState<string | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // ---- 담은 장소 / 상세 모달 ----
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  // place_id -> itinerary_place_id. 제거(DELETE) 시 itinerary_place_id가 필요해서 따로 기억해둔다.
  // NOTE: 현재 백엔드에 "이미 담긴 장소 목록" GET이 없어서 새로고침하면 초기화됨 - 추후 보완 필요.
  const [itineraryPlaceIds, setItineraryPlaceIds] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!itineraryId) {
      showToast({
        variant: 'error',
        message: '일정 정보를 찾을 수 없어요. 처음부터 다시 시도해주세요.',
      });
    }
  }, [itineraryId, showToast]);

  // 검색 드롭다운 바깥 클릭 시 닫기
  // useEffect(() => {
  //   if (!isSearchOpen) return;

  //   const handleOutsideClick = (event: MouseEvent) => {
  //     if (!searchWrapperRef.current?.contains(event.target as Node)) {
  //       setIsSearchOpen(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleOutsideClick);
  //   return () => document.removeEventListener('mousedown', handleOutsideClick);
  // }, [isSearchOpen]);

  const savedByCategory = useMemo(() => {
    const grouped: Record<PlaceCategory, Place[]> = { restaurant: [], cafe: [], activity: [] };
    savedPlaces.forEach((place) => grouped[place.category].push(place));
    return grouped;
  }, [savedPlaces]);

  const isSaved = (place: Place) => savedPlaces.some((p) => p.id === place.id);

  const scrollChatToEnd = () => {
    requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  };

  const pushMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
    scrollChatToEnd();
  };

  // 채팅 -> /itineraries/{iId}/places/recommend (카테고리 기반 추천)
  const handleChatSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = chatValue.trim();
    if (!text) return;

    pushMessage({ id: nextId(), role: 'user', kind: 'text', text });
    setChatValue('');

    const category = detectCategory(text);
    setIsTyping(true);
    try {
      const places = await recommendPlaces(
        itineraryId,
        category ? uiCategoryToApi(category) : undefined,
      );
      setIsTyping(false);

      if (places.length === 0) {
        pushMessage({
          id: nextId(),
          role: 'ai',
          kind: 'text',
          text: '조건에 맞는 장소를 찾지 못했어요. 다른 조건으로 찾아드릴까요?',
        });
        return;
      }

      pushMessage({ id: nextId(), role: 'ai', kind: 'text', text: '이런 곳은 어때요?' });
      pushMessage({ id: nextId(), role: 'ai', kind: 'places', places: places.slice(0, 6) });
    } catch (error) {
      setIsTyping(false);
      const apiError = toApiClientError(error);
      pushMessage({
        id: nextId(),
        role: 'ai',
        kind: 'text',
        text: apiError.message ?? '장소를 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
      });
    }
  };

  // 검색바 -> /map/search (드롭다운으로 결과 표시, 채팅과 무관)
  const handleSearchSubmit = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    // 직전과 같은 검색어면 재요청하지 않고 이미 있는 결과로 드롭다운만 다시 연다
    if (trimmed === lastSearchedQuery) {
      setIsSearchOpen(true);
      return;
    }

    setIsSearchOpen(true);
    setIsSearchLoading(true);
    try {
      const results = await searchPlaces(trimmed);
      setSearchResults(results);
      setLastSearchedQuery(trimmed);
    } catch (error) {
      const apiError = toApiClientError(error);
      setSearchResults([]);
      setLastSearchedQuery(null);
      showToast({
        variant: 'error',
        message: apiError.message ?? '검색에 실패했어요. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleAddPlace = async (place: Place) => {
    if (isSaved(place)) return;

    try {
      const itineraryPlaceId = await addPlaceToItinerary(itineraryId, place.id);
      setSavedPlaces((prev) => [...prev, place]);
      setItineraryPlaceIds((prev) => ({ ...prev, [place.id]: itineraryPlaceId }));
      showToast({
        variant: 'info',
        message: `${place.name}을(를) ${CATEGORY_LABEL[place.category]}에 담았어요`,
      });
    } catch (error) {
      const apiError = toApiClientError(error);
      showToast({
        variant: 'error',
        message: apiError.message ?? '장소를 담지 못했어요. 잠시 후 다시 시도해주세요.',
      });
    }
  };

  const handleRemovePlace = async (place: Place) => {
    const itineraryPlaceId = itineraryPlaceIds[place.id];
    if (!itineraryPlaceId) {
      setSavedPlaces((prev) => prev.filter((p) => p.id !== place.id));
      return;
    }

    try {
      await removePlaceFromItinerary(itineraryId, itineraryPlaceId);
      setSavedPlaces((prev) => prev.filter((p) => p.id !== place.id));
      setItineraryPlaceIds((prev) => {
        const next = { ...prev };
        delete next[place.id];
        return next;
      });
    } catch (error) {
      const apiError = toApiClientError(error);
      showToast({
        variant: 'error',
        message: apiError.message ?? '장소를 제거하지 못했어요. 잠시 후 다시 시도해주세요.',
      });
    }
  };

  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const handleGoToPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      await generatePlan(itineraryId);
      navigate(`/plan/${itineraryId}`);
    } catch {
      showToast({ variant: 'error', message: '일정 생성에 실패했어요. 잠시 후 다시 시도해주세요' });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.content}>
      <div className={styles.searchRow}>
        <div className={styles.searchWrapper} ref={searchWrapperRef}>
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onSubmit={handleSearchSubmit}
            placeholder="장소, 맛집, 카페 검색해서 바로 추가해보세요"
            className={styles.searchBar}
          />

          {isSearchOpen && (
  <div className={styles.searchDropdown}>
    <div className={styles.searchDropdownHeader}>
      <Typography variant="caption" color="tertiary">
        {isSearchLoading ? '검색 중...' : `검색 결과 ${searchResults.length}건`}
      </Typography>
      <button
        type="button"
        className={styles.searchDropdownClose}
        onClick={() => setIsSearchOpen(false)}
        aria-label="검색 결과 닫기"
      >
        ×
      </button>
    </div>

      {isSearchLoading ? (
        <div className={styles.searchDropdownList}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonItem}>
              <div className={styles.skeletonThumb} />
              <div className={styles.skeletonLines}>
                <div className={styles.skeletonLine} style={{ width: '55%' }} />
                <div className={styles.skeletonLine} style={{ width: '35%' }} />
              </div>
            </div>
          ))}
        </div>
          ) : searchResults.length === 0 ? (
            <div className={styles.searchDropdownEmpty}>
              <Typography variant="caption" color="tertiary">
                검색 결과가 없어요
              </Typography>
            </div>
          ) : (
            <div className={styles.searchDropdownList}>
              {searchResults.map((place) => (
                <PlaceListItem
                  key={place.id}
                  place={place}
                  variant="comfortable"
                  onClick={setSelectedPlace}
                />
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
      <div className={styles.main}>
        <div className={styles.chatPanel}>
          <div className={styles.panelHeader}>
            <Typography variant="h2">AI 추천</Typography>
            <Typography variant="caption" color="tertiary">
              원하는 조건을 말해보세요
            </Typography>
          </div>

          <div className={styles.chatScroll}>
            {messages.map((message) => {
              if (message.kind === 'places') {
                return (
                  <div key={message.id} className={styles.placeCardRow}>
                    {message.places.map((place) => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        added={isSaved(place)}
                        onAdd={handleAddPlace}
                        onClick={setSelectedPlace}
                      />
                    ))}
                  </div>
                );
              }
              return (
                <div
                  key={message.id}
                  className={
                    message.role === 'ai' ? styles.aiBubbleRow : styles.userBubbleRow
                  }
                >
                  <Typography
                    variant="body"
                    className={message.role === 'ai' ? styles.aiBubble : styles.userBubble}
                  >
                    {message.text}
                  </Typography>
                </div>
              );
            })}

            {isTyping && (
              <div className={styles.aiBubbleRow}>
                <div className={styles.typingBubble}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <form className={styles.chatInputRow} onSubmit={handleChatSubmit}>
            <Input
              value={chatValue}
              onChange={(event) => setChatValue(event.target.value)}
              placeholder="메시지를 입력하세요"
              className={styles.chatInput}
            />
            <Button type="submit" variant="primary" size="md" aria-label="전송">
              ↑
            </Button>
          </form>
        </div>

        <div className={styles.savedPanel}>
          <div className={styles.panelHeader}>
            <Typography variant="h2">담은 장소</Typography>
            <Typography variant="caption" color="tertiary">
              카테고리별로 모아서 보여드려요
            </Typography>
          </div>

          <div className={styles.categoryList}>
            {CATEGORY_ORDER.map((category) => {
              const places = savedByCategory[category];
              return (
                <div key={category} className={styles.categorySection}>
                  <div className={styles.categorySectionHeader}>
                    <Typography variant="h3">{CATEGORY_LABEL[category]}</Typography>
                    <Typography variant="caption" color="tertiary">
                      {places.length}곳
                    </Typography>
                  </div>

                  {places.length === 0 ? (
                    <div className={styles.emptyState}>
                      <Typography variant="caption" color="tertiary">
                        아직 담은 {CATEGORY_LABEL[category]}이(가) 없어요
                      </Typography>
                    </div>
                  ) : (
                    <div className={styles.categoryItemList}>
                      {places.map((place) => (
                        <PlaceListItem
                          key={place.id}
                          place={place}
                          onClick={setSelectedPlace}
                          onRemove={handleRemovePlace}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.savedPanelFooter}>
            <Button
              variant="primary"
              size="md"
              className={styles.goToPlanButton}
              onClick={handleGoToPlan}
              disabled={savedPlaces.length === 0 || isGeneratingPlan}
            >
              {isGeneratingPlan ? '일정 생성 중...' : '일정 만들기'}
            </Button>
          </div>
        </div>
      </div>
      </div>

      <PlaceDetailModal
        place={selectedPlace}
        added={selectedPlace ? isSaved(selectedPlace) : false}
        onAdd={handleAddPlace}
        onClose={() => setSelectedPlace(null)}
      />
    </div>
  );
}