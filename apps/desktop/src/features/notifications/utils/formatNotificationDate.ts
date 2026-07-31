export const parseNotificationDate = (value: string): Date | null => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const formatNotificationDate = (
  value: string,
  timeZone?: string,
): string => {
  const parsedDate = parseNotificationDate(value);

  if (!parsedDate) {
    return 'Data non disponibile';
  }

  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    ...(timeZone ? { timeZone } : {}),
  });
  const nowParts = formatter.formatToParts(now);
  const parsedParts = formatter.formatToParts(parsedDate);

  const nowDateKey = `${nowParts.find((part) => part.type === 'year')?.value}-${nowParts.find((part) => part.type === 'month')?.value}-${nowParts.find((part) => part.type === 'day')?.value}`;
  const parsedDateKey = `${parsedParts.find((part) => part.type === 'year')?.value}-${parsedParts.find((part) => part.type === 'month')?.value}-${parsedParts.find((part) => part.type === 'day')?.value}`;

  const isSameDay = nowDateKey === parsedDateKey;

  if (isSameDay) {
    return new Intl.DateTimeFormat('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...(timeZone ? { timeZone } : {}),
    }).format(parsedDate);
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    ...(timeZone ? { timeZone } : {}),
  }).format(parsedDate);
};
