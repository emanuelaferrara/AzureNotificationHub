import type { Notification } from '../types/Notification';

export const sortNotificationsByDateDesc = (
  a: Notification,
  b: Notification,
): number => {
  const aTime = Date.parse(a.createdAt);
  const bTime = Date.parse(b.createdAt);

  if (Number.isNaN(aTime) && Number.isNaN(bTime)) {
    return 0;
  }

  if (Number.isNaN(aTime)) {
    return 1;
  }

  if (Number.isNaN(bTime)) {
    return -1;
  }

  return bTime - aTime;
};
