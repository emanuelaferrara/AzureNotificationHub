import { formatNotificationDate, parseNotificationDate } from './formatNotificationDate';

describe('formatNotificationDate', () => {
  it('parses ISO timestamps correctly', () => {
    const parsed = parseNotificationDate('2026-07-28T14:54:55.000Z');

    expect(parsed).toEqual(new Date('2026-07-28T14:54:55.000Z'));
  });

  it('formats ISO timestamps for the notification list', () => {
    expect(formatNotificationDate('2026-07-28T14:54:55.000Z', 'UTC')).toBe(
      '28/07/2026, 14:54',
    );
  });

  it('uses the provided timezone when formatting dates', () => {
    expect(formatNotificationDate('2026-07-28T15:04:44.000Z', 'Europe/Rome')).toBe(
      '28/07/2026, 17:04',
    );
  });

  it('returns a fallback for invalid dates', () => {
    expect(formatNotificationDate('not-a-date')).toBe('Data non disponibile');
  });
});
