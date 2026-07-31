// typography.ts

import { Platform, TextStyle } from 'react-native';

export const typography = {
  headline: Platform.select<TextStyle>({
    macos: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 22,
    },
    ios: {
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 22,
    },
    android: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
    },
  }),

  body: Platform.select<TextStyle>({
    macos: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 22,
    },
    ios: {
      fontSize: 17,
      fontWeight: '400',
      lineHeight: 22,
    },
    android: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
  }),

  caption: Platform.select<TextStyle>({
    macos: {
      fontSize: 12,
      fontWeight: '400',
    },
    ios: {
      fontSize: 12,
      fontWeight: '400',
    },
    android: {
      fontSize: 12,
      fontWeight: '400',
    },
  }),
};