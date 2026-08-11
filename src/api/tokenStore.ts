// AuthContext(React state)와 axios 인터셉터(React 바깥) 양쪽에서
// 같은 토큰을 참조/갱신하기 위한 최소한의 pub-sub 스토어입니다.
type Listener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<Listener>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  listeners.forEach((listener) => listener(token));
}

export function subscribeAccessToken(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
