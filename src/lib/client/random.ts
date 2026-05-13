const MAX_UINT32_PLUS_ONE = 4294967296;

export function randomInt(min: number, max: number): number {
  if (min > max) {
    throw new Error("min must be less than or equal to max");
  }

  const range = max - min + 1;
  const limit = MAX_UINT32_PLUS_ONE - (MAX_UINT32_PLUS_ONE % range);
  const buf = new Uint32Array(1);

  let value: number;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);

  return min + (value % range);
}

export function randomFloat(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / MAX_UINT32_PLUS_ONE;
}

export function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
