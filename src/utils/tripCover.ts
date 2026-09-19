import coverBusan1 from '../assets/covers/cover_busan1.jpg';
import coverBusan2 from '../assets/covers/cover_busan2.jpg';
import coverBusan3 from '../assets/covers/cover_busan3.jpg';
import coverDaejeon1 from '../assets/covers/cover_daejeon1.jpg';
import coverDaejeon2 from '../assets/covers/cover_daejeon2.jpg';
import coverGangneung1 from '../assets/covers/cover_gangneung1.jpg';
import coverJeju1 from '../assets/covers/cover_jeju1.jpg';
import coverJeju2 from '../assets/covers/cover_jeju2.jpg';
import coverJeju3 from '../assets/covers/cover_jeju3.jpg';
import coverJeonju1 from '../assets/covers/cover_jeonju1.jpg';
import coverJeonju2 from '../assets/covers/cover_jeonju2.jpg';
import coverJeonju3 from '../assets/covers/cover_jeonju3.jpg';
import coverSeoul1 from '../assets/covers/cover_seoul1.jpg';
import coverSeoul2 from '../assets/covers/cover_seoul2.jpg';
import coverSeoul3 from '../assets/covers/cover_seoul3.jpg';

const REGION_COVERS: Record<string, string[]> = {
  서울: [coverSeoul1, coverSeoul2, coverSeoul3],
  부산: [coverBusan1, coverBusan2, coverBusan3],
  전주: [coverJeonju1, coverJeonju2, coverJeonju3],
  제주: [coverJeju1, coverJeju2, coverJeju3],
  대전: [coverDaejeon1, coverDaejeon2],
  강릉: [coverGangneung1],
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** region + itineraryId로 지역 커버 이미지를 고른다. 같은 일정은 항상 같은 이미지가 나온다. */
export function getTripCoverImage(region: string, itineraryId: string): string | undefined {
  const matchedKey = Object.keys(REGION_COVERS).find((key) => region.includes(key));
  if (!matchedKey) return undefined;

  const images = REGION_COVERS[matchedKey];
  const index = hashString(itineraryId) % images.length;
  return images[index];
}
