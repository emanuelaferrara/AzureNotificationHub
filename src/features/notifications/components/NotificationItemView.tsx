import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/AppText';
import { Notification } from '../types/Notification';
import { useAppTheme } from '../../../theme/useAppTheme';

export const NotificationItemView: React.FC<NotificationItemViewProps> = ({
  notification,
}) => {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.headerContainer}>
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
          {notification.createdAt}
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
  );
};

export type NotificationItemViewProps = {
  notification: Notification;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  title: {
    flex: 1,
  },

  date: {
    marginLeft: 12,
  },

  body: {
    lineHeight: 22,
  },
});
