import {SafeAreaView, StatusBar} from 'react-native';
import {NotificationListScreen} from './features/notifications/screens/NotificationListScreen';

export default function App() {
  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="light-content" />

      <NotificationListScreen />
    </SafeAreaView>
  );
}
