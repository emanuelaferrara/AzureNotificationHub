import React, { useContext, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../../theme/useAppTheme';
import { EmptyNotificationsView } from '../components/EmptyNotificationsView';
import { NotificationItemView } from '../components/NotificationItemView';
import { NotificationsContext } from '../context/NotificationsContext';
import { sortNotificationsByDateDesc } from '../utils/sortNotifications';
import { AppText } from '../../../components/AppText';

export const NotificationListScreen: React.FC = () => {
  const theme = useAppTheme();
  const constexState = useContext(NotificationsContext);

  const notificationState = constexState?.state ?? {
    list: [],
    notifications: {},
  };

  const sortedNotifications = useMemo(
    () => sortNotificationsByDateDesc(notificationState),
    [notificationState],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppText
        variant="headline"
        style={[
          styles.title,
          {
            color: theme.textPrimary,
          },
        ]}
      >
        All Notifications
      </AppText>
      <FlatList
        data={sortedNotifications}
        keyExtractor={item => item}
        contentContainerStyle={
          sortedNotifications.length === 0 ? styles.emptyContent : undefined
        }
        ListEmptyComponent={<EmptyNotificationsView />}
        renderItem={({ item }) => (
          <NotificationItemView
            notification={notificationState.notifications[item]}
          />
        )}
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
    title: {
    flex: 1,
    padding: 16,
    marginBottom: 16
  },

});
