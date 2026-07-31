import React from 'react';
import { StyleSheet, View } from 'react-native';

type NotificationDotProps = {
  size?: number;
};

export const NotificationDot: React.FC<NotificationDotProps> = ({
  size = 6,
}) => {
  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    backgroundColor: '#4287f5',
  },
});
