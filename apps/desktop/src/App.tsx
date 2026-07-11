import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NotificationListScreen } from './features/notifications/screens/NotificationListScreen';
import { useEffect } from 'react';
import { getNotifications } from './services/azure/AzureService';

export default function App() {
  useEffect(() => {
    getNotifications();
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
