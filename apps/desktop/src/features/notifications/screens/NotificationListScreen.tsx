import React, { useContext, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../../theme/useAppTheme';
import { EmptyNotificationsView } from '../components/EmptyNotificationsView';
import { NotificationItemView } from '../components/NotificationItemView';
import { NotificationsContext } from '../context/NotificationsContext';
import { sortNotificationsByDateDesc } from '../utils/sortNotifications';
import { AppText } from '../../../components/AppText';
import type { NotificationState } from '../context/NotificationsContext';

const EMPTY_NOTIFICATION_STATE: NotificationState = {
  list: [],
  notifications: {},
};

type Props = {
  onOpenSettings: () => void;
};

export const NotificationListScreen: React.FC<Props> = ({ onOpenSettings }) => {
  const theme = useAppTheme();
  const constexState = useContext(NotificationsContext);

  const notificationState = constexState?.state ?? EMPTY_NOTIFICATION_STATE;

  const sortedNotifications = useMemo(
    () => sortNotificationsByDateDesc(notificationState),
    [notificationState],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <AppText
          variant="headline"
          style={[styles.title, { color: theme.textPrimary }]}
        >
          All Notifications
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={onOpenSettings}
          style={({ pressed }) => [
            styles.settingsButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <AppText variant="body" style={{ color: theme.accent }}>
            Settings
          </AppText>
        </Pressable>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  title: {
    flex: 1,
  },
  settingsButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
