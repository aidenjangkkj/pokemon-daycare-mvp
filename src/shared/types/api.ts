export interface CacheEntry<TValue> {
  value: TValue;
  createdAt: number;
  expiresAt: number;
}

export interface PokeApiNamedResource {
  name: string;
  url: string;
}
