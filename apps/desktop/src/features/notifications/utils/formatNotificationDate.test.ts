import { formatNotificationDate, parseNotificationDate } from './formatNotificationDate';

describe('formatNotificationDate', () => {
  it('parses ISO timestamps correctly', () => {
    const parsed = parseNotificationDate('2026-07-28T14:54:55.000Z');

    expect(parsed).toEqual(new Date('2026-07-28T14:54:55.000Z'));
  });

  it('formats older dates in a compact form', () => {
    expect(formatNotificationDate('2026-07-28T14:54:55.000Z', 'UTC')).toBe(
      '28 Jul',
    );
  });

  it('shows only the time for notifications from today', () => {
    const today = new Date();
    const todayIso = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 14, 30),
    ).toISOString();

    expect(formatNotificationDate(todayIso, 'UTC')).toBe('14:30');
  });

  it('returns a fallback for invalid dates', () => {
    expect(formatNotificationDate('not-a-date')).toBe('Data non disponibile');
  });
});
