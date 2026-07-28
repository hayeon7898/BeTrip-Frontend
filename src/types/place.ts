export type PlaceCategory = 'restaurant' | 'cafe' | 'activity';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  rating: number;
  tags: string[];
  priceLabel: string;
  image?: string;
  menuSummary: string[];
  reviewSummary: string;
  photos: string[];
  latitude: number;
  longitude: number;
}

export const CATEGORY_LABEL: Record<PlaceCategory, string> = {
  restaurant: '음식점',
  cafe: '카페',
  activity: '활동',
};

export const CATEGORY_ORDER: PlaceCategory[] = ['restaurant', 'cafe', 'activity'];