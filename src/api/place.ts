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
// ------------------------------------------------------------------
// 장소 이동 PATCH /itineraries/{iId}/places/{placeId}
// ------------------------------------------------------------------
interface ItineraryPlaceMoveResponse {
  itinerary_place_id: string;
  place_id: string;
  day: number;
  time_slot: TimeSlot;
  order_in_day: number;
  start_time: string | null;
  travel_time_to_next_min: number | null;
}

export interface MovePlaceDestination {
  day: number;
  time_slot: TimeSlot;
}

export async function movePlaceInItinerary(
  itineraryId: string,
  placeId: string,
  destination: MovePlaceDestination,
): Promise<ItineraryPlaceMoveResponse> {
  try {
    const response = await apiClient.patch<ItineraryPlaceMoveResponse>(
      `/itineraries/${itineraryId}/places/${placeId}`,
      destination,
    );
    return response.data;
  } catch (error) {
    throw toApiClientError(error);
  }
}

// ------------------------------------------------------------------
// 순서 재정렬 PATCH /itineraries/{iId}/places/reorder
// ------------------------------------------------------------------
export interface ReorderPlacesTarget {
  day: number;
  time_slot: TimeSlot;
  place_ids: string[];
}

export async function reorderPlacesInItinerary(
  itineraryId: string,
  target: ReorderPlacesTarget,
): Promise<ItineraryPlaceMoveResponse[]> {
  try {
    const response = await apiClient.patch<ItineraryPlaceMoveResponse[]>(
      `/itineraries/${itineraryId}/places/reorder`,
      target,
    );
    return response.data;
  } catch (error) {
    throw toApiClientError(error);
  }
}