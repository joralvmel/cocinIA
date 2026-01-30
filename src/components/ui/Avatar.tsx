import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  source?: ImageSourcePropType | string;
  name?: string;
  icon?: keyof typeof FontAwesome.glyphMap;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const fontSizes: Record<AvatarSize, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

const iconSizes: Record<AvatarSize, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export function Avatar({
  source,
  name,
  icon = 'user',
  size = 'md',
  className = '',
}: AvatarProps) {
  const { colors } = useAppTheme();
  const hasImage = source !== undefined;

  const getInitials = () => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (hasImage) {
    const imageSource = typeof source === 'string' ? { uri: source } : source;
    return (
      <Image
        source={imageSource as ImageSourcePropType}
        className={`rounded-full ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <View className={`items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 ${sizeClasses[size]} ${className}`}>
      {name ? (
        <Text className={`font-bold text-primary-600 dark:text-primary-400 ${fontSizes[size]}`}>
          {getInitials()}
        </Text>
      ) : (
        <FontAwesome name={icon} size={iconSizes[size]} color={colors.primary} />
      )}
    </View>
  );
}

// AvatarGroup for displaying multiple avatars
export interface AvatarGroupProps {
  avatars: Array<{ source?: string; name?: string }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = 'sm',
  className = '',
}: AvatarGroupProps) {
  const displayedAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <View className={`flex-row items-center ${className}`}>
      {displayedAvatars.map((avatar, index) => (
        <View
          key={index}
          className={`border-2 border-white dark:border-gray-900 rounded-full ${index > 0 ? '-ml-2' : ''}`}
        >
          <Avatar source={avatar.source} name={avatar.name} size={size} />
        </View>
      ))}
      {remaining > 0 && (
        <View className={`items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-900 -ml-2 ${sizeClasses[size]}`}>
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">+{remaining}</Text>
        </View>
      )}
    </View>
  );
}
