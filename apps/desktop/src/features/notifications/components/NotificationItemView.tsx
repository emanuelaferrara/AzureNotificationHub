import React, { useState } from 'react';
import { StyleSheet, View, Linking, Pressable } from 'react-native';
import { AppText } from '../../../components/AppText';
import type { Notification as NotificationItem } from '../types/Notification';
import { useAppTheme } from '../../../theme/useAppTheme';
import { NotificationDot } from './NotificationDot';
import { formatNotificationDate } from '../utils/formatNotificationDate';
import Divider from '../../../components/Divider';

export const NotificationItemView: React.FC<NotificationItemViewProps> = ({
  notification,
}) => {
  const theme = useAppTheme();
  const formattedCreatedAt = formatNotificationDate(notification.createdAt);
  const hasUrl = Boolean(notification.url);
  const [hovered, setHovered] = useState(false);

  const cardBackgroundColor = notification.read ? theme.card : theme.cardUnread;

  const titleColor = notification.read ? theme.textPrimary : theme.accent;

  const handlePress = () => {
    if (!hasUrl) return;
    Linking.openURL(notification.url!).catch(error => {
      console.error('Failed to open notification URL:', error);
    });
  };

  return (
    <View>
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
                : theme.cardUnread
              : hovered
              ? notification.read
                ? theme.cardUnreadHovered
                : theme.cardHovered
              : cardBackgroundColor,
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
      </Pressable>
      <Divider></Divider>
    </View>
  );
};

export type NotificationItemViewProps = {
  notification: NotificationItem;
};

const styles = StyleSheet.create({
  card: {
    paddingTop: 16,
    paddingBottom: 16,
  },

  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingEnd: 8,
  },

  content: {
    flex: 1,
    flexDirection: 'column',
  },

  trailingIconContainer: {
    marginTop: 8,
     marginHorizontal: 12
  },

  title: {
    flex: 1,
  },

  date: {},

  body: {},
});
