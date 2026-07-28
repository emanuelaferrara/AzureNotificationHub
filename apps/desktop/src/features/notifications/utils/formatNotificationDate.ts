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
    return 'Date not available';
  }

  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    ...(timeZone ? { timeZone } : {}),
  }).format(parsedDate);
};
