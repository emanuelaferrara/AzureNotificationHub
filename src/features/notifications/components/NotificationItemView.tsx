import React from 'react';
import { View } from 'react-native';
import { AppText } from '../../../components/AppText';
import { Notification } from '../types/Notification';

export const NotificationItemView: React.FC<NotificationItemViewProps> = ({
  notification,
}) => {
  return (
    <View>
      <AppText variant="headline"> {notification.title} </AppText>
      <AppText variant="body"> {notification.body} </AppText>
      <AppText variant="caption"> {notification.createdAt} </AppText>
    </View>
  );
};

export type NotificationItemViewProps = {
  notification: Notification;
};
