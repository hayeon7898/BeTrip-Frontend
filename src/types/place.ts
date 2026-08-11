export type PlaceCategory = 'restaurant' | 'cafe' | 'activity';
export type ApiPlaceCategory = 'RESTAURANT' | 'CAFE' | 'ACTIVITY';

export interface Place {
  id: string; // place_id
  name: string;
  category: PlaceCategory;
  address?: string;
  thumbnailUrl?: string;
  latitude: number;
  longitude: number;
}

// GET /map/places/{placeId} 응답에만 있는 필드(place_url)까지 포함
export interface PlaceDetail extends Place {
  placeUrl: string; // 카카오맵 상세 페이지 - 클라이언트에서 웹뷰/새탭으로 열기
}

export const CATEGORY_LABEL: Record<PlaceCategory, string> = {
  restaurant: '음식점',
  cafe: '카페',
  activity: '활동',
};

export const CATEGORY_ORDER: PlaceCategory[] = ['restaurant', 'cafe', 'activity'];

const API_TO_UI_CATEGORY: Record<ApiPlaceCategory, PlaceCategory> = {
  RESTAURANT: 'restaurant',
  CAFE: 'cafe',
  ACTIVITY: 'activity',
};

const UI_TO_API_CATEGORY: Record<PlaceCategory, ApiPlaceCategory> = {
  restaurant: 'RESTAURANT',
  cafe: 'CAFE',
  activity: 'ACTIVITY',
};

export function apiCategoryToUi(category: ApiPlaceCategory): PlaceCategory {
  return API_TO_UI_CATEGORY[category];
}

export function uiCategoryToApi(category: PlaceCategory): ApiPlaceCategory {
  return UI_TO_API_CATEGORY[category];
}