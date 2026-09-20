import { apiClient, toApiClientError } from './client';
import type { ItineraryStatus, ScheduleApi } from './itineraries';

interface PlanGenerateResponse {
  itinerary_id: string;
  status: ItineraryStatus;
  schedule: ScheduleApi | null;
}

export async function generatePlan(itineraryId: string): Promise<PlanGenerateResponse> {
  try {
    const response = await apiClient.post<PlanGenerateResponse>(
      `/itineraries/${itineraryId}/plans/generate`,
    );
    return response.data;
  } catch (error) {
    throw toApiClientError(error);
  }
}

interface PlanSaveResponse {
  itinerary_id: string;
  status: ItineraryStatus;
  saved_at: string;
}

export async function savePlan(itineraryId: string): Promise<PlanSaveResponse> {
  try {
    const response = await apiClient.post<PlanSaveResponse>(
      `/itineraries/${itineraryId}/plans/save`,
    );
    return response.data;
  } catch (error) {
    throw toApiClientError(error);
  }
}
