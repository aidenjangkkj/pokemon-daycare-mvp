import { getWithCache, ONE_DAY_MS } from "./cache";

const POKE_API_BASE_URL = "https://pokeapi.co/api/v2";

function resolvePokeApiUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  return `${POKE_API_BASE_URL}${pathOrUrl}`;
}

export async function requestPokeApi<TResponse>(
  pathOrUrl: string,
): Promise<TResponse> {
  const response = await fetch(resolvePokeApiUrl(pathOrUrl));

  if (!response.ok) {
    throw new Error(`PokeAPI request failed: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export function requestCachedPokeApi<TResponse>(
  cacheKey: string,
  pathOrUrl: string,
): Promise<TResponse> {
  return getWithCache<TResponse>({
    key: cacheKey,
    ttlMs: ONE_DAY_MS,
    fetcher: () => requestPokeApi<TResponse>(pathOrUrl),
  });
}
