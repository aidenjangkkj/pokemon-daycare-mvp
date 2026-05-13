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

export function getStorageKeys(): string[] {
  return Object.keys(localStorage);
}

export function isQuotaExceededError(error: unknown): boolean {
  if (!(error instanceof DOMException)) {
    return false;
  }

  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED"
  );
}

export function tryWriteStorageJson<TValue>(key: string, value: TValue): boolean {
  try {
    writeStorageJson(key, value);
    return true;
  } catch {
    return false;
  }
}
