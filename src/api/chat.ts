import { apiClient, toApiClientError } from './client';
import type { ApiPlaceItem, Place } from '../types/place';
import { mapApiPlace } from '../types/place';

// ------------------------------------------------------------------
// 대화형 장소 추천 POST /itineraries/{iId}/chat
// ------------------------------------------------------------------
interface ChatApiResponse {
  reply: string;
  places: ApiPlaceItem[];
}

export interface ChatResult {
  reply: string;
  places: Place[];
}

export async function sendChatMessage(
  itineraryId: string,
  message: string,
): Promise<ChatResult> {
  try {
    const response = await apiClient.post<ChatApiResponse>(
      `/itineraries/${itineraryId}/chat`,
      { message },
    );
    return {
      reply: response.data.reply,
      places: response.data.places.map(mapApiPlace),
    };
  } catch (error) {
    throw toApiClientError(error);
  }
}