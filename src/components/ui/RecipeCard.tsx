import React from 'react';
import { View, Text, Pressable, Image, ImageSourcePropType } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Badge } from './Badge';
import { IconButton } from './IconButton';

export interface RecipeCardProps {
  title: string;
  description?: string;
  image?: ImageSourcePropType | string;
  time?: string;
  servings?: number;
  calories?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
  variant?: 'default' | 'compact' | 'horizontal';
  className?: string;
}

export function RecipeCard({
  title,
  description,
  image,
  time,
  servings,
  calories,
  difficulty,
  tags,
  isFavorite = false,
  onPress,
  onFavoritePress,
  variant = 'default',
  className = '',
}: RecipeCardProps) {
  const { colors } = useAppTheme();

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDifficultyLabel = () => {
    switch (difficulty) {
      case 'easy':
        return 'Easy';
      case 'medium':
        return 'Medium';
      case 'hard':
        return 'Hard';
      default:
        return '';
    }
  };

  const imageSource = typeof image === 'string' ? { uri: image } : image;

  // Compact variant for lists
  if (variant === 'compact') {
    return (
      <Pressable
        onPress={onPress}
        className={`flex-row items-center rounded-xl p-3 bg-gray-50 dark:bg-gray-800 ${className}`}
      >
        {image ? (
          <Image source={imageSource as ImageSourcePropType} className="w-16 h-16 rounded-lg mr-3" resizeMode="cover" />
        ) : (
          <View className="w-16 h-16 rounded-lg mr-3 items-center justify-center bg-primary-100 dark:bg-primary-900">
            <FontAwesome name="cutlery" size={24} color={colors.primary} />
          </View>
        )}
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 dark:text-gray-50" numberOfLines={1}>{title}</Text>
          <View className="flex-row items-center mt-1 gap-3">
            {time && (
              <View className="flex-row items-center">
                <FontAwesome name="clock-o" size={12} color={colors.textMuted} />
                <Text className="text-xs ml-1 text-gray-400 dark:text-gray-500">{time}</Text>
              </View>
            )}
            {servings && (
              <View className="flex-row items-center">
                <FontAwesome name="users" size={12} color={colors.textMuted} />
                <Text className="text-xs ml-1 text-gray-400 dark:text-gray-500">{servings}</Text>
              </View>
            )}
            {calories && (
              <View className="flex-row items-center">
                <FontAwesome name="fire" size={12} color={colors.textMuted} />
                <Text className="text-xs ml-1 text-gray-400 dark:text-gray-500">{calories} kcal</Text>
              </View>
            )}
          </View>
        </View>
        <FontAwesome name="chevron-right" size={14} color={colors.textMuted} />
      </Pressable>
    );
  }

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <Pressable
        onPress={onPress}
        className={`flex-row rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 ${className}`}
      >
        {image && (
          <Image source={imageSource as ImageSourcePropType} className="w-28 h-28" resizeMode="cover" />
        )}
        <View className={`flex-1 p-3 justify-between ${!image ? 'py-4' : ''}`}>
          <View>
            <Text className="font-semibold text-gray-900 dark:text-gray-50" numberOfLines={1}>{title}</Text>
            {description && (
              <Text className="text-sm mt-1 text-gray-500 dark:text-gray-400" numberOfLines={2}>{description}</Text>
            )}
          </View>
          <View className="flex-row items-center flex-wrap gap-3 mt-2">
            {time && (
              <View className="flex-row items-center">
                <FontAwesome name="clock-o" size={12} color={colors.primary} />
                <Text className="text-xs ml-1 font-medium text-gray-700 dark:text-gray-300">{time}</Text>
              </View>
            )}
            {servings && (
              <View className="flex-row items-center">
                <FontAwesome name="users" size={12} color={colors.primary} />
                <Text className="text-xs ml-1 font-medium text-gray-700 dark:text-gray-300">{servings}</Text>
              </View>
            )}
            {calories && (
              <View className="flex-row items-center">
                <FontAwesome name="fire" size={12} color={colors.primary} />
                <Text className="text-xs ml-1 font-medium text-gray-700 dark:text-gray-300">{calories} kcal</Text>
              </View>
            )}
            {difficulty && (
              <Badge label={getDifficultyLabel()} variant={getDifficultyColor() as any} size="sm" />
            )}
          </View>
        </View>
      </Pressable>
    );
  }

  // Default card variant
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 ${className}`}
    >
      {/* Image */}
      <View className="relative">
        {image ? (
          <Image source={imageSource as ImageSourcePropType} className="w-full h-40" resizeMode="cover" />
        ) : (
          <View className="w-full h-40 items-center justify-center bg-primary-100 dark:bg-primary-900">
            <FontAwesome name="cutlery" size={48} color={colors.primary} />
          </View>
        )}
        {onFavoritePress && (
          <View className="absolute top-2 right-2">
            <IconButton icon={isFavorite ? 'heart' : 'heart-o'} variant="secondary" size="sm" onPress={onFavoritePress} />
          </View>
        )}
        {difficulty && (
          <View className="absolute bottom-2 left-2">
            <Badge label={getDifficultyLabel()} variant={getDifficultyColor() as any} size="sm" />
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-4">
        <Text className="font-semibold text-lg text-gray-900 dark:text-gray-50" numberOfLines={1}>{title}</Text>
        {description && (
          <Text className="text-sm mt-1 text-gray-500 dark:text-gray-400" numberOfLines={2}>{description}</Text>
        )}

        {/* Info badges */}
        <View className="flex-row items-center gap-4 mt-3">
          {time && (
            <View className="flex-row items-center">
              <FontAwesome name="clock-o" size={14} color={colors.primary} />
              <Text className="text-sm ml-1.5 font-medium text-gray-900 dark:text-gray-50">{time}</Text>
            </View>
          )}
          {servings && (
            <View className="flex-row items-center">
              <FontAwesome name="users" size={14} color={colors.primary} />
              <Text className="text-sm ml-1.5 font-medium text-gray-900 dark:text-gray-50">{servings}</Text>
            </View>
          )}
          {calories && (
            <View className="flex-row items-center">
              <FontAwesome name="fire" size={14} color={colors.primary} />
              <Text className="text-sm ml-1.5 font-medium text-gray-900 dark:text-gray-50">{calories} kcal</Text>
            </View>
          )}
        </View>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mt-3">
            {tags.slice(0, 3).map((tag, index) => (
              <View key={index} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                <Text className="text-xs text-gray-500 dark:text-gray-400">{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}
