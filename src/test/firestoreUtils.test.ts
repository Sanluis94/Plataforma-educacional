import { describe, expect, it } from 'vitest';
import { GeoPoint, Timestamp } from 'firebase/firestore';
import { sanitizeForFirestore } from '../modules/core/services/firestoreUtils';

describe('sanitizeForFirestore', () => {
  it('omits undefined fields recursively without discarding valid falsey values', () => {
    const data = { omitted: undefined, values: [{ omitted: undefined, count: 0, visible: false, note: null }] };
    expect(sanitizeForFirestore(data)).toStrictEqual({ values: [{ count: 0, visible: false, note: null }] });
    expect(Object.hasOwn(data, 'omitted')).toBe(true);
  });

  it('preserves SDK field values when they are nested in plain objects', () => {
    const timestamp = Timestamp.fromMillis(12345);
    const point = new GeoPoint(-23.5, -47.5);
    const sanitized = sanitizeForFirestore({ values: [{ timestamp, point, omitted: undefined }] });
    expect(sanitized.values[0].timestamp).toBe(timestamp);
    expect(sanitized.values[0].point).toBe(point);
  });
});
