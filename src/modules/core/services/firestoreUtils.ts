export function sanitizeForFirestore<T = any>(data: T): T {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  // Firestore value types (Timestamp, GeoPoint, DocumentReference, etc.) must
  // reach the SDK as instances rather than being flattened into plain fields.
  if (typeof data === 'object' &&
    (Object.getPrototypeOf(data) === Object.prototype || Object.getPrototypeOf(data) === null)) {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        sanitized[key] = sanitizeForFirestore(value);
      }
    }
    return sanitized as T;
  }
  return data;
}

