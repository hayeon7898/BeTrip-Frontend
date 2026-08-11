import { apiClient, toApiClientError } from './client';
import type { ApiPlaceCategory, Place, PlaceDetail } from '../types/place';
import { apiCategoryToUi } from '../types/place';

interface ApiPlaceItem {
  place_id: string;
  name: string;
  category: ApiPlaceCategory;
  address?: string | null;
  lat: number;
  lng: number;
  thumbnail_url?: string | null;
}

function mapApiPlace(item: ApiPlaceItem): Place {
  return {
    id: item.place_id,
    name: item.name,
    category: apiCategoryToUi(item.category),
    address: item.address ?? undefined,
    thumbnailUrl: item.thumbnail_url ?? undefined,
    latitude: item.lat,
    longitude: item.lng,
  };
}

// ------------------------------------------------------------------
// 장소 추천 GET /itineraries/{iId}/places/recommend
// ------------------------------------------------------------------
interface PlaceRecommendResponse {
  places: ApiPlaceItem[];
}

export async function recommendPlaces(
  itineraryId: string,
  category?: ApiPlaceCategory,
): Promise<Place[]> {
  try {
    const response = await apiClient.get<PlaceRecommendResponse>(
      `/itineraries/${itineraryId}/places/recommend`,
      { params: category ? { category } : undefined },
    );
    return response.data.places.map(mapApiPlace);
  } catch (error) {
    throw toApiClientError(error);
  }
}

// ------------------------------------------------------------------
// 지도 키워드 검색 GET /map/search (상단 SearchBar용, itinerary_place 도메인 밖)
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

// ------------------------------------------------------------------
// 장소 담기 POST /itineraries/{iId}/places
// ------------------------------------------------------------------
interface ItineraryPlaceCreateResponse {
  itinerary_place_id: string;
  itinerary_id: string;
  place_id: string;
}

export async function addPlaceToItinerary(
  itineraryId: string,
  placeId: string,
): Promise<string> {
  try {
    const response = await apiClient.post<ItineraryPlaceCreateResponse>(
      `/itineraries/${itineraryId}/places`,
      { place_id: placeId },
    );
    return response.data.itinerary_place_id;
  } catch (error) {
    throw toApiClientError(error);
  }
}

// ------------------------------------------------------------------
// 장소 제거 DELETE /itineraries/{iId}/places/{itineraryPlaceId}
// ------------------------------------------------------------------
export async function removePlaceFromItinerary(
  itineraryId: string,
  itineraryPlaceId: string,
): Promise<void> {
  try {
    await apiClient.delete(`/itineraries/${itineraryId}/places/${itineraryPlaceId}`);
  } catch (error) {
    throw toApiClientError(error);
  }
}