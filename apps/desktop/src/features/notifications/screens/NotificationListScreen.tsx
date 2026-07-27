import React, { useContext } from 'react';
import { FlatList, View } from 'react-native';
import { useAppTheme } from '../../../theme/useAppTheme';
import { NotificationItemView } from '../components/NotificationItemView';
import { NotificationsContext } from '../context/NotificationsContext';

export const NotificationListScreen: React.FC = () => {
  const theme = useAppTheme();
  const notificationsState = useContext(NotificationsContext)
  const notifications = notificationsState?.notifications

  return (
    <View style={{ backgroundColor: theme.background }}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <NotificationItemView notification={item} />}
      />
    </View>
  );
};

