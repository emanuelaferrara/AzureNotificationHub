import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/AppText';
import { useAppTheme } from '../../../theme/useAppTheme';

export const EmptyNotifications: React.FC = () => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <AppText variant="headline" style={{ color: theme.textPrimary }}>
        Nessuna notifica
      </AppText>
      <AppText variant="body" style={{ color: theme.textSecondary, marginTop: 8 }}>
        Le nuove notifiche compariranno qui.
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
});
