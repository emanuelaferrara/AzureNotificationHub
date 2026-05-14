import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NotificationListScreen } from './features/notifications/screens/NotificationListScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <NotificationListScreen />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
