import React, { useEffect, useState } from 'react';
import { Notification } from '../types/Notification';
import { NotificationItemView } from '../components/NotificationItemView';

export const NotificationListScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>();

  useEffect(() => {
    const _notifications = fetchNotifications();
    setNotifications(_notifications);
  }, [setNotifications]);

  return notifications?.map(notification => {
    return (
      <NotificationItemView notification={notification} key={notification.id} />
    );
  });
};

function fetchNotifications(): Notification[] {
  const notification: Notification[] = [
    {
      id: '1',
      title: 'Test 1',
      body: 'body',
      createdAt: '12 Maggio 2026',
      read: true,
    },
    {
      id: '2',
      title: 'Test 2',
      body: 'body',
      createdAt: '1 Maggio 2026',
      read: false,
    },
    {
      id: '3',
      title: 'Test 3',
      body: 'body',
      createdAt: '25 Aprile 2026',
      read: false,
    },
    {
      id: '4',
      title: 'Test 4',
      body: 'body',
      createdAt: '2 Marzo 2026',
      read: false,
    },
    {
      id: '5',
      title: 'Test 5',
      body: 'body',
      createdAt: '30 Gennaio 2026',
      read: false,
    },
  ];
  return notification;
}
