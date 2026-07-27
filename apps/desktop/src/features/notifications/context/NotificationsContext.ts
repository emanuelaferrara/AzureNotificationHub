import { createContext } from 'react';
import { Notification } from '../types/Notification';

export const NotificationsContext = createContext<NotificationContextState|undefined>(undefined);

export type NotificationContextState = {
    notifications: Notification[];
    setNotifications: (notifications: Notification[]) => void
}