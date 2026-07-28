import React, { useState } from 'react';
import { StyleSheet, View, Linking, Pressable } from 'react-native';
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
  const hasUrl = Boolean(notification.url);
  const [hovered, setHovered] = useState(false);

  const cardBackgroundColor = notification.read
    ? theme.card
    : 'rgba(77, 163, 255, 0.09)';

  const cardBorderColor = notification.read ? theme.border : theme.accent;
  const titleColor = notification.read ? theme.textPrimary : theme.accent;

  const handlePress = () => {
    if (!hasUrl) return;
    Linking.openURL(notification.url!).catch(error => {
      console.error('Failed to open notification URL:', error);
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.card,
        styles.container,
        {
          backgroundColor: pressed
            ? notification.read
              ? theme.card
              : 'rgba(77, 163, 255, 0.14)'
            : hovered
            ? notification.read
              ? '#f2f2f2'
              : 'rgba(77, 163, 255, 0.16)'
            : cardBackgroundColor,
          borderColor: cardBorderColor,
          opacity: pressed ? 0.94 : 1,
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
    </Pressable>
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
