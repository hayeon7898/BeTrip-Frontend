import { apiClient } from './client';

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
  const { itineraries } = await apiClient.get<ItineraryListResponse>('/itineraries');
  return itineraries;
}

export function deleteItinerary(itineraryId: string): Promise<void> {
  return apiClient.delete<void>(`/itineraries/${itineraryId}`);
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

export function createItineraryConditions(
  payload: ItineraryConditionsRequest,
): Promise<ItineraryCreateResponse> {
  return apiClient.post<ItineraryCreateResponse>('/itineraries/conditions', payload);
}
