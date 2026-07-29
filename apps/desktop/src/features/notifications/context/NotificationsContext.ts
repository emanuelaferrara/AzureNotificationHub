import { createContext } from 'react';
import { Notification } from '../types/Notification';

export const NotificationsContext = createContext<NotificationContextState|undefined>(undefined);

export type NotificationState = {
    notifications: {
        [uid: string]: Notification;
    },
    list: string[];
}

export type NotificationContextState = {
    state: NotificationState
    setState: (state: NotificationState) => void
}