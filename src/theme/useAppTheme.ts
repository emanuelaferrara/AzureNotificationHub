import { useColorScheme } from 'react-native';

import { darkTheme, lightTheme } from './themes';

export function useAppTheme() {
  const colorScheme = useColorScheme();

  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
