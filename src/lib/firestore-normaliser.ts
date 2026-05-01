import { Timestamp, FieldValue } from 'firebase-admin/firestore';

/**
 * Detects Firestore FieldValue (serverTimestamp, deleteField, etc.)
 */
function isFieldValue(value: any): boolean {
  return (
    value &&
    typeof value === 'object' &&
    '_methodName' in value
  );
}

/**
 * Converts Firestore values into frontend-safe JSON
 */
export function normaliseFirestoreData<T>(data: T): any {
  if (data === null || data === undefined) return data;

  // Firestore Timestamp
  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }

  // Arrays
  if (Array.isArray(data)) {
    return data.map(normaliseFirestoreData);
  }

  // Objects
  if (typeof data === 'object') {
    const output: Record<string, any> = {};

    for (const [key, value] of Object.entries(data as any)) {

      // Timestamp inside object
      if (value instanceof Timestamp) {
        output[key] = value.toDate().toISOString();
        continue;
      }

      // FieldValue (serverTimestamp, deleteField, etc.)
      if (isFieldValue(value)) {
        output[key] = null; // safest frontend representation
        continue;
      }

      // Nested objects
      if (typeof value === 'object' && value !== null) {
        output[key] = normaliseFirestoreData(value);
        continue;
      }

      output[key] = value;
    }

    return output;
  }

  return data;
}

