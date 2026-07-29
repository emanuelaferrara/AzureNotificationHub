import React, { useContext, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../../theme/useAppTheme';
import { EmptyNotificationsView } from '../components/EmptyNotificationsView';
import { NotificationItemView } from '../components/NotificationItemView';
import { NotificationsContext } from '../context/NotificationsContext';
import { sortNotificationsByDateDesc } from '../utils/sortNotifications';

export const NotificationListScreen: React.FC = () => {
  const theme = useAppTheme();
  const constexState = useContext(NotificationsContext);

  const notificationState = constexState?.state ?? {list: [], notifications: {}};

  const sortedNotifications = useMemo(() => 
      sortNotificationsByDateDesc(notificationState)
  , [notificationState]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }] }>
      <FlatList
        data={sortedNotifications}
        keyExtractor={item => item}
        contentContainerStyle={sortedNotifications.length === 0 ? styles.emptyContent : undefined}
        ListEmptyComponent={<EmptyNotificationsView />}
        renderItem={({ item }) => <NotificationItemView notification={notificationState.notifications[item]} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContent: {
    flexGrow: 1,
  },
});

