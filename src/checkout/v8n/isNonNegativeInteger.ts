export function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}
