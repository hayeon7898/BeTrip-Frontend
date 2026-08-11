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
