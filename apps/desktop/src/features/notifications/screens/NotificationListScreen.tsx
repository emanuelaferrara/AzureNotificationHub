import React, { useContext, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../../theme/useAppTheme';
import { EmptyNotificationsView } from '../components/EmptyNotificationsView';
import { NotificationItemView } from '../components/NotificationItemView';
import { NotificationsContext } from '../context/NotificationsContext';
import { sortNotificationsByDateDesc } from '../utils/sortNotifications';

export const NotificationListScreen: React.FC = () => {
  const theme = useAppTheme();
  const notificationsState = useContext(NotificationsContext);
  const notifications = notificationsState?.notifications ?? [];

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(sortNotificationsByDateDesc);
  }, [notifications]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }] }>
      <FlatList
        data={sortedNotifications}
        keyExtractor={item => item.id}
        contentContainerStyle={sortedNotifications.length === 0 ? styles.emptyContent : undefined}
        ListEmptyComponent={<EmptyNotificationsView />}
        renderItem={({ item }) => <NotificationItemView notification={item} />}
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

