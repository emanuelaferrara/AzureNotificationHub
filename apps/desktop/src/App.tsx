import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NotificationListScreen } from './features/notifications/screens/NotificationListScreen';
import { useEffect } from 'react';
import { setSubscriptions } from './services/azure/AzureService';
import { notify, requestPermission } from 'react-native-mac-notifications';

export default function App() {
  useEffect(() => {
    // Ensure Azure DevOps relay subscriptions exist (idempotent, fire-and-forget).
    setSubscriptions();

    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      console.log('Connected!');
    };

    const setup = async () => {
      const granted = await requestPermission();

      socket.onmessage = event => {
        type Message = {
          title: string;
          body: string;
          notify: boolean;
        }
        const newMessage = JSON.parse(event.data) as Message;
        console.log('New message received:', event);

        if (granted) {
          notify({
            title: newMessage.title,
            body: newMessage.body,
          }).catch(error => {
            console.error('Error showing notification:', error);
          });
        }
      };
    };

    setup();
    return () => socket.close();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <NotificationListScreen />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
