import { apiClient, toApiClientError } from './client';
import type { ItineraryStatus } from './itineraries';

interface PlanGenerateResponse {
  itinerary_id: string;
  status: ItineraryStatus;
  schedule: unknown;
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
