import { apiClient, toApiClientError } from './client';
import type { ApiPlaceCategory, ApiPlaceItem, Place } from '../types/place';
import { mapApiPlace } from '../types/place';
import type { TimeSlot } from './itineraries';

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
// 장소 담기 POST /itineraries/{iId}/places
// ------------------------------------------------------------------
interface ItineraryPlaceCreateResponse {
  itinerary_place_id: string;
  itinerary_id: string;
  place_id: string;
}

export interface AddPlaceSchedule {
  day: number;
  time_slot: TimeSlot;
  order_in_day: number;
}

export async function addPlaceToItinerary(
  itineraryId: string,
  placeId: string,
  schedule?: AddPlaceSchedule,
): Promise<string> {
  try {
    const response = await apiClient.post<ItineraryPlaceCreateResponse>(
      `/itineraries/${itineraryId}/places`,
      schedule ? { place_id: placeId, ...schedule } : { place_id: placeId },
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
