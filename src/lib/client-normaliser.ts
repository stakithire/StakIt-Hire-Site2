/**
 * Frontend utility to normalize Firestore data.
 * Converts Firestore Timestamps into ISO strings for consistent handling in React components.
 */
export function normaliseClientData<T>(data: T): any {
  if (data === null || data === undefined) return data;

  // Check for Firestore Timestamp (both SDK and plain objects that look like them)
  if (
    typeof data === 'object' &&
    data !== null &&
    'seconds' in data &&
    'nanoseconds' in data &&
    typeof (data as any).toDate === 'function'
  ) {
    return (data as any).toDate().toISOString();
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map(normaliseClientData);
  }

  // Handle Objects
  if (typeof data === 'object') {
    const output: Record<string, any> = {};

    for (const [key, value] of Object.entries(data as any)) {
      // Check for nested Timestamps
      if (
        value &&
        typeof value === 'object' &&
        'seconds' in value &&
        typeof (value as any).toDate === 'function'
      ) {
        output[key] = (value as any).toDate().toISOString();
        continue;
      }

      // Handle nested objects/arrays
      if (typeof value === 'object' && value !== null) {
        output[key] = normaliseClientData(value);
        continue;
      }

      output[key] = value;
    }

    return output;
  }

  return data;
}
