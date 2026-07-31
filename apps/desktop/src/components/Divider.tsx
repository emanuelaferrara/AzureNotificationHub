import React from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../theme/useAppTheme';

interface DividerProps {
  width?: number;
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  dividerStyle?: any;
}

const Divider: React.FC<DividerProps> = ({
  width = 1,
  orientation = 'horizontal',
  color,
  dividerStyle,
}) => {
  const theme = useAppTheme();
  const dividerStyles = [
    { width: orientation === 'horizontal' ? '100%' : width },
    { height: orientation === 'vertical' ? '100%' : width },
    { backgroundColor: color ?? theme.separator },
    dividerStyle,
  ];

  return <View style={dividerStyles} />;
};

export default Divider;
