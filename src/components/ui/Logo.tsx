import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: StyleProp<ImageStyle>;
}

const sizeMap = {
  sm: 60,
  md: 80,
  lg: 120,
  xl: 160,
};

export function Logo({ size = 'md', style }: LogoProps) {
  const dimension = sizeMap[size];

  return (
    <Image
      source={require('../../../assets/images/CocinIA.png')}
      style={[
        {
          width: dimension,
          height: dimension,
          resizeMode: 'contain',
        },
        style,
      ]}
      accessibilityLabel="CocinIA Logo"
    />
  );
}
