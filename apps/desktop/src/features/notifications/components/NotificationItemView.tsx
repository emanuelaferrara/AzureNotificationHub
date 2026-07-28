import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/AppText';
import type { Notification as NotificationItem } from '../types/Notification';
import { useAppTheme } from '../../../theme/useAppTheme';
import { NotificationDot } from './NotificationDot';
import { formatNotificationDate } from '../utils/formatNotificationDate';

export const NotificationItemView: React.FC<NotificationItemViewProps> = ({
  notification,
}) => {
  const theme = useAppTheme();
  const formattedCreatedAt = formatNotificationDate(notification.createdAt);

  return (
    <View
      style={[
        styles.card,
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.trailingIconContainer}>
        {!notification.read && <NotificationDot />}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <AppText
            variant="headline"
            style={[
              styles.title,
              {
                color: theme.textPrimary,
              },
            ]}
          >
            {notification.title}
          </AppText>

          <AppText
            variant="caption"
            style={[
              styles.date,
              {
                color: theme.textTertiary,
              },
            ]}
          >
            {formattedCreatedAt}
          </AppText>
        </View>

        <AppText
          variant="body"
          style={[
            styles.body,
            {
              color: theme.textSecondary,
            },
          ]}
        >
          {notification.body}
        </AppText>
      </View>
    </View>
  );
};

export type NotificationItemViewProps = {
  notification: NotificationItem;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
  },

  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  content: {
    flex: 1,
    flexDirection: 'column',
  },

  trailingIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
  },

  title: {
    flex: 1,
  },

  date: {},

  body: {
    lineHeight: 22,
  },
});
