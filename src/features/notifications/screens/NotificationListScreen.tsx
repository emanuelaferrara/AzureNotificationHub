import React, {useEffect, useState} from 'react';
import {Notification} from '../types/Notification';
import {Text} from 'react-native';

export const NotificationListScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>();

  useEffect(() => {
    const _notifications = fetchNotifications();
    setNotifications(_notifications);
  }, [setNotifications]);

  return notifications?.map(notification => {
    return <Text> {notification.title} </Text>;
  });
};

function fetchNotifications(): Notification[] {
  const notification: Notification[] = [
    {id: '1', title: 'Test 1', body: 'body', createdAt: '', read: true},
    {id: '2', title: 'Test 2', body: 'body', createdAt: '', read: false},
    {id: '3', title: 'Test 3', body: 'body', createdAt: '', read: false},
    {id: '4', title: 'Test 4', body: 'body', createdAt: '', read: false},
    {id: '5', title: 'Test 5', body: 'body', createdAt: '', read: false},
  ];
  return notification;
}
