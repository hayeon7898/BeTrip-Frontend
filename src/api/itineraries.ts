import { apiClient, toApiClientError } from './client';
import type { ApiPlaceCategory } from '../types/place';

export type ItineraryStatus = 'DRAFT' | 'GENERATED' | 'SAVED';

export interface ItinerarySummary {
  itinerary_id: string;
  title: string | null;
  region: string;
  start_date: string;
  end_date: string;
  status: ItineraryStatus;
  thumbnail_url: string | null;
  updated_at: string;
}

interface ItineraryListResponse {
  itineraries: ItinerarySummary[];
}

export async function getItineraries(): Promise<ItinerarySummary[]> {
  try {
    const response = await apiClient.get<ItineraryListResponse>('/itineraries');
    return response.data.itineraries;
  } catch (error) {
    throw toApiClientError(error);
  }
}

export async function deleteItinerary(itineraryId: string): Promise<void> {
  try {
    await apiClient.delete(`/itineraries/${itineraryId}`);
  } catch (error) {
    throw toApiClientError(error);
  }
}

export type TimeSlot = 'MORNING' | 'LUNCH' | 'EVENING';
export type Transportation = 'CAR' | 'PUBLIC_TRANSPORT';
export type Purpose = 'FRIEND' | 'FAMILY' | 'COUPLE' | 'PET' | 'PARENTS';
export type TravelStyle = 'ACTIVITY' | 'NATURE' | 'SIGHTSEEING' | 'RELAXATION' | 'FOOD';

export interface ItineraryConditionsRequest {
  start_date: string;
  end_date: string;
  region: string;
  arrival_time: TimeSlot;
  departure_time: TimeSlot;
  transportation?: Transportation;
  purpose?: Purpose;
  styles?: TravelStyle[];
}

interface ItineraryCreateResponse {
  itinerary_id: string;
  status: ItineraryStatus;
  created_at: string;
}

export async function createItineraryConditions(
  payload: ItineraryConditionsRequest,
): Promise<ItineraryCreateResponse> {
  try {
    const response = await apiClient.post<ItineraryCreateResponse>(
      '/itineraries/conditions',
      payload,
    );
    return response.data;
  } catch (error) {
    throw toApiClientError(error);
  }
}

// ------------------------------------------------------------------
// 상세조회 GET /itineraries/{id} — 이미 담기고 배치된 장소/스케줄 조회용.
// ------------------------------------------------------------------

export interface ScheduleItemApi {
  place_id: string;
  name: string;
  time_slot: TimeSlot;
  start_time: string | null;
  order_in_day: number;
  travel_time_to_next_min: number | null;
}

export interface ScheduleDayApi {
  day: number;
  date: string;
  items: ScheduleItemApi[];
}

export interface ScheduleApi {
  days: ScheduleDayApi[];
}

export interface ItineraryPlaceDetail {
  itinerary_place_id: string;
  place_id: string;
  name: string;
  category: ApiPlaceCategory;
  address: string | null;
  thumbnail_url: string | null;
  day: number | null;
  time_slot: TimeSlot | null;
  order_in_day: number | null;
  lat: number;
  lng: number;
}

export interface ItineraryDetail {
  itinerary_id: string;
  status: ItineraryStatus;
  conditions: ItineraryConditionsRequest;
  places: ItineraryPlaceDetail[];
  schedule: ScheduleApi | null;
  updated_at: string;
}

export async function getItineraryDetail(itineraryId: string): Promise<ItineraryDetail> {
  try {
    const response = await apiClient.get<ItineraryDetail>(`/itineraries/${itineraryId}`);
    return response.data;
  } catch (error) {
    throw toApiClientError(error);
  }
}
