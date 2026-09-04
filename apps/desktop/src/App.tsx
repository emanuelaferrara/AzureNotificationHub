import { StatusBar, Linking } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NotificationListScreen } from './features/notifications/screens/NotificationListScreen';
import { useEffect, useState } from 'react';
import { setSubscriptions } from './services/azure/AzureService';
import {
  NotificationsContext,
  NotificationState,
} from './features/notifications/context/NotificationsContext';
import {
  notify,
  requestPermission,
  addNotificationResponseListener,
  getInitialNotificationResponse,
  getDeliveredNotifications,
  DISMISS_ACTION_IDENTIFIER,
  type NotificationResponse,
} from 'react-native-mac-notifications';
import type { Notification as AppNotification } from './features/notifications/types/Notification';
import { SubscriptionSettingsScreen } from './features/settings/screens/SubscriptionSettingsScreen';

// Shape of a notification pushed by the backend over the WebSocket. Mirrors the
// backend's NotificationPayload (only the fields this demo touches are typed).
type IncomingNotification = {
  id: string;
  title: string;
  body: string;
  url?: string;
  createdAt: string;
  read: boolean;
};

export default function App() {
  const [screen, setScreen] = useState<'notifications' | 'settings'>('notifications');
  const [state, setState] = useState<NotificationState>({
    notifications: {},
    list: [],
  });

  useEffect(() => {
    // Ensure Azure DevOps relay subscriptions exist (idempotent, fire-and-forget).
    setSubscriptions();

    // --- Incoming notifications over the WebSocket -----------------------
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      console.log('Connected!');
    };

    // --- Notification interaction handling -------------------------------
    // The package tells us WHICH notification was interacted with (via the
    // opaque `userInfo` we attached in notify()) and HOW (actionIdentifier:
    // clicked vs dismissed). Deciding what to do is app logic and lives here.
    const handleResponse = (response: NotificationResponse) => {
      const id = response.userInfo?.id as string;
      const url = response.userInfo?.url;

      if (response.actionIdentifier === DISMISS_ACTION_IDENTIFIER) {
        console.log('Notification dismissed', { id, response });
        // your code here — e.g. notificationStore.markSeen(id);

        socket.send(JSON.stringify({ type: 'read', id }));
        setState(state => {
          return {
            ...state,
            notifications: {
              ...state.notifications,
              [id]: {
                ...state.notifications[id],
                read: true,
              },
            },
          };
        });

        return;
      }

      // Default action: the user clicked/opened the notification. If it carries
      // a URL, open it in the default browser.
      console.log('Notification clicked', { id, url, response });
      if (typeof url === 'string' && url.length > 0) {
        Linking.openURL(url).catch(error => {
          console.error('Failed to open URL:', url, error);
        });

        socket.send(JSON.stringify({ type: 'read', id }));
        setState(state => {
          return {
            ...state,
            notifications: {
              ...state.notifications,
              [id]: {
                ...state.notifications[id],
                read: true,
              },
            },
          };
        });
      }
      // your code here — e.g. notificationStore.markRead(id), or navigate to a
      // screen when there's no URL.
    };

    // Cold start: the app may have been launched by clicking a notification.
    getInitialNotificationResponse().then(response => {
      if (response) {
        handleResponse(response);
      }
    });

    // Demo: read what's currently sitting in Notification Center. Handy for
    // rehydrating app state on launch (and removeDeliveredNotifications([id]) /
    // removeAllDeliveredNotifications() clear them once handled).
    getDeliveredNotifications().then(delivered => {
      console.log(`${delivered.length} delivered notifications`, delivered);
    });

    // Warm: clicks while the app is already running.
    const unsubscribe = addNotificationResponseListener(handleResponse);

    const setup = async () => {
      const granted = await requestPermission();
      socket.onmessage = event => {
        const incoming = JSON.parse(event.data) as IncomingNotification;

        if (granted) {
          const notification: AppNotification = {
            id: incoming.id,
            title: incoming.title,
            body: incoming.body,
            url: incoming.url,
            createdAt: incoming.createdAt,
            read: incoming.read,
          };

          if (!incoming.read) {
            notify({
              title: notification.title,
              body: notification.body,
              userInfo: { id: notification.id, url: notification.url },
            }).catch(error => {
              console.error('Error showing notification:', error);
            });
          }

          setState(state => ({
            ...state,
            notifications: {
              ...state.notifications,
              [notification.id]: notification,
            },
            list: [...state.list, notification.id],
          }));
        }
      };
    };

    setup();
    return () => {
      unsubscribe();
      socket.close();
    };
  }, []);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <NotificationsContext.Provider value={{ state, setState }}>
          <StatusBar barStyle="light-content" />
          {screen === 'notifications' ? (
            <NotificationListScreen onOpenSettings={() => setScreen('settings')} />
          ) : (
            <SubscriptionSettingsScreen onClose={() => setScreen('notifications')} />
          )}
        </NotificationsContext.Provider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
