import { Text, TextProps } from 'react-native';
import { typography } from '../theme/typography';

type Props = TextProps & {
  variant?: keyof typeof typography;
};

export function AppText({ variant = 'body', style, ...props }: Props) {
  return (
    <Text allowFontScaling style={[typography[variant], style]} {...props} />
  );
}
