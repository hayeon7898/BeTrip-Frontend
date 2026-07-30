import { useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header/Header';
import SearchBar from '../components/SearchBar/SearchBar';
import Typography from '../components/Typography/Typography';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import PlaceCard from '../components/PlaceCard/PlaceCard';
import PlaceListItem from '../components/PlaceListItem/PlaceListItem';
import PlaceDetailModal from '../components/Modal/PlaceDetailModal';
import { useToast } from '../components/Toast/useToast';
import { MOCK_PLACES } from '../mocks/PlanMockData';
import { CATEGORY_LABEL, CATEGORY_ORDER } from '../types/place';
import type { Place, PlaceCategory } from '../types/place';
import styles from './PlacePage.module.css';

type ChatMessage =
  | { id: string; role: 'ai' | 'user'; kind: 'text'; text: string }
  | { id: string; role: 'ai'; kind: 'places'; places: Place[] };

let messageId = 0;
const nextId = () => `msg-${++messageId}`;

export default function PlacePage() {
  const [searchParams] = useSearchParams();
  const loggedIn = searchParams.get('loggedIn') === 'true';
  const { showToast } = useToast();

  const [searchValue, setSearchValue] = useState('');
  const [chatValue, setChatValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), role: 'ai', kind: 'text', text: '어떤 여행 스타일을 원하세요?' },
  ]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  const respondWithPlaces = (places: Place[], notFoundLabel?: string) => {
    setIsTyping(true);
    window.setTimeout(() => {
      setIsTyping(false);
      if (places.length === 0) {
        pushMessage({
          id: nextId(),
          role: 'ai',
          kind: 'text',
          text: notFoundLabel
            ? `'${notFoundLabel}'와(과) 어울리는 장소를 찾지 못했어요. 다른 키워드로 찾아드릴까요?`
            : '조건에 맞는 장소를 찾지 못했어요. 다른 조건으로 찾아드릴까요?',
        });
        return;
      }
      pushMessage({ id: nextId(), role: 'ai', kind: 'text', text: '이런 곳은 어때요?' });
      pushMessage({ id: nextId(), role: 'ai', kind: 'places', places: places.slice(0, 6) });
    }, 500);
  };

  const handleSearchSubmit = (query: string) => {
    pushMessage({ id: nextId(), role: 'user', kind: 'text', text: query });
    setSearchValue('');
    const results = MOCK_PLACES.filter(
      (place) => place.name.includes(query) || place.tags.some((tag) => tag.includes(query)),
    );
    respondWithPlaces(results, query);
  };

  // 데모용 아주 단순한 키워드 매칭 로직입니다. 실제로는 AI 추천 API 응답으로 대체하면 됩니다.
  const handleChatSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = chatValue.trim();
    if (!text) return;

    pushMessage({ id: nextId(), role: 'user', kind: 'text', text });
    setChatValue('');

    let candidates = MOCK_PLACES;
    if (/카페|커피|디저트/.test(text)) {
      candidates = candidates.filter((p) => p.category === 'cafe');
    } else if (/액티비티|체험|산책|투어/.test(text)) {
      candidates = candidates.filter((p) => p.category === 'activity');
    } else if (/식당|맛집|저녁|점심|다이닝/.test(text)) {
      candidates = candidates.filter((p) => p.category === 'restaurant');
    }
    if (/저렴|가성비/.test(text)) {
      candidates = [...candidates].sort((a, b) => a.priceLabel.localeCompare(b.priceLabel));
    }
    if (/조용/.test(text)) {
      candidates = candidates.filter((p) => p.tags.some((tag) => tag.includes('조용')));
    }

    respondWithPlaces(candidates.length > 0 ? candidates : MOCK_PLACES);
  };

  const handleAddPlace = (place: Place) => {
    setSavedPlaces((prev) => (prev.some((p) => p.id === place.id) ? prev : [...prev, place]));
    showToast({ variant: 'info', message: `${place.name}을(를) ${CATEGORY_LABEL[place.category]}에 담았어요` });
  };

  const handleRemovePlace = (place: Place) => {
    setSavedPlaces((prev) => prev.filter((p) => p.id !== place.id));
  };

  return (
    <div className={styles.page}>
      <Header loggedIn={loggedIn} />

      <div className={styles.content}>
      <div className={styles.searchRow}>
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          onSubmit={handleSearchSubmit}
          placeholder="장소, 맛집, 카페 검색해서 바로 추가해보세요"
          className={styles.searchBar}
        />
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