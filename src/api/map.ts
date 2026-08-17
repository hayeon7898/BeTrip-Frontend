import { apiClient, toApiClientError } from './client';
import type { ApiPlaceItem, Place, PlaceDetail } from '../types/place';
import { mapApiPlace } from '../types/place';

// ------------------------------------------------------------------
// 지도 키워드 검색 GET /map/search (상단 SearchBar용)
// ------------------------------------------------------------------
interface PlaceSearchResponse {
  places: ApiPlaceItem[];
}

export async function searchPlaces(query: string): Promise<Place[]> {
  try {
    const response = await apiClient.get<PlaceSearchResponse>('/map/search', {
      params: { q: query },
    });
    return response.data.places.map(mapApiPlace);
  } catch (error) {
    throw toApiClientError(error);
  }
}

// ------------------------------------------------------------------
// 장소 상세 GET /map/places/{placeId}
// ------------------------------------------------------------------
interface ApiPlaceDetail extends ApiPlaceItem {
  place_url: string;
}

export async function getPlaceDetail(placeId: string): Promise<PlaceDetail> {
  try {
    const response = await apiClient.get<ApiPlaceDetail>(`/map/places/${placeId}`);
    return { ...mapApiPlace(response.data), placeUrl: response.data.place_url };
  } catch (error) {
    throw toApiClientError(error);
  }
}
