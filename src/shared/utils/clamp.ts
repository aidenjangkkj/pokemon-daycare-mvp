export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampStat(value: number): number {
  return clamp(value, 0, 100);
}
