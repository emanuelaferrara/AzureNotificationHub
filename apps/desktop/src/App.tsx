import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NotificationListScreen } from './features/notifications/screens/NotificationListScreen';
import { useEffect } from 'react';
import { getNotifications } from './services/azure/AzureService';
import { notify, requestPermission } from 'react-native-mac-notifications';

export default function App() {
  useEffect(() => {
    getNotifications();

    (async () => {
      const granted = await requestPermission();
      if (granted) {
        await notify({
          title: 'Azure Notification Hub',
          body: 'Native macOS notifications are wired up 🎉',
        });
      }
    })();
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
