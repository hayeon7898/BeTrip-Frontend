export {};

// 카카오맵 SDK는 공식 타입 패키지가 없어서, 저희가 실제로 쓰는 부분만 최소로 선언했어요.
// 더 넓게 쓰게 되면 인터페이스를 필요한 만큼 확장하면 됩니다.
declare global {
  interface KakaoLatLng {
    getLat(): number;
    getLng(): number;
  }

  interface KakaoLatLngBounds {
    extend(latlng: KakaoLatLng): void;
  }

  interface KakaoMapInstance {
    setBounds(bounds: KakaoLatLngBounds): void;
    relayout(): void;
  }

  interface KakaoCustomOverlayOptions {
    position: KakaoLatLng;
    content: HTMLElement | string;
    xAnchor?: number;
    yAnchor?: number;
  }

  interface KakaoCustomOverlay {
    setMap(map: KakaoMapInstance | null): void;
  }

  interface KakaoMapOptions {
    center: KakaoLatLng;
    level?: number;
  }

  interface KakaoMapsNamespace {
    Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMapInstance;
    LatLng: new (lat: number, lng: number) => KakaoLatLng;
    LatLngBounds: new () => KakaoLatLngBounds;
    CustomOverlay: new (options: KakaoCustomOverlayOptions) => KakaoCustomOverlay;
    load: (callback: () => void) => void;
  }

  interface Window {
    kakao: {
      maps: KakaoMapsNamespace;
    };
  }
}