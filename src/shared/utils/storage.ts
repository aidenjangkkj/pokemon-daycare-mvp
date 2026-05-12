export function readStorageJson<TValue>(key: string): TValue | null {
  const rawValue = localStorage.getItem(key);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as TValue;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function writeStorageJson<TValue>(key: string, value: TValue): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorageItem(key: string): void {
  localStorage.removeItem(key);
}
