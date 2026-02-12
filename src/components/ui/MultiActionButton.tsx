import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, ActivityIndicator, Animated } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface ActionOption {
  id: string;
  label: string;
  icon: string;
  color?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface MultiActionButtonProps {
  icon?: string;
  label?: string;
  options: ActionOption[];
  loading?: boolean;
  disabled?: boolean;
  variant?: 'inline' | 'floating';
  floatingColor?: string;
}

export function MultiActionButton({
  icon = 'plus',
  label,
  options,
  loading = false,
  disabled = false,
  variant = 'inline',
  floatingColor = 'primary-600',
}: MultiActionButtonProps) {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useAppTheme();

  // Use refs to persist animations across re-renders
  const animationsRef = useRef<Array<{ scale: Animated.Value; opacity: Animated.Value }>>([]);
  const rotateAnimRef = useRef(new Animated.Value(0));
  const backdropOpacityRef = useRef(new Animated.Value(0));

  // Initialize animations array when options length changes
  useEffect(() => {
    if (animationsRef.current.length !== options.length) {
      animationsRef.current = options.map(() => ({
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
      }));
    }
  }, [options.length]);

  useEffect(() => {
    const rotateAnim = rotateAnimRef.current;
    const backdropOpacity = backdropOpacityRef.current;
    const animations = animationsRef.current;

    if (expanded) {
      // Reset all animations to 0 before starting
      animations.forEach(anim => {
        anim.scale.setValue(0);
        anim.opacity.setValue(0);
      });
      backdropOpacity.setValue(0);
      rotateAnim.setValue(0);

      // Fade in backdrop
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Rotate main button
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Animate options in with stagger
      const staggerAnimations = animations.map((anim, index) => {
        return Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1,
            tension: 100,
            friction: 7,
            delay: index * 50,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 200,
            delay: index * 50,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.parallel(staggerAnimations).start();
    } else {
      // Fade out backdrop
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();

      // Rotate back
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Animate options out
      const closeAnimations = animations.map((anim, index) => {
        return Animated.parallel([
          Animated.timing(anim.scale, {
            toValue: 0,
            duration: 150,
            delay: (animations.length - 1 - index) * 30,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 150,
            delay: (animations.length - 1 - index) * 30,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.parallel(closeAnimations).start();
    }
  }, [expanded]);

  const handleMainPress = () => {
    if (options.length === 1) {
      options[0].onPress();
    } else {
      setExpanded(!expanded);
    }
  };

  const handleOptionPress = (option: ActionOption) => {
    if (option.disabled || option.loading) return;
    setExpanded(false);
    setTimeout(() => option.onPress(), 200);
  };

  const getColorClasses = (color?: string) => {
    const colorMap: Record<string, { bg: string; shadow: string }> = {
      red: { bg: 'bg-red-500', shadow: 'shadow-red-500/30' },
      green: { bg: 'bg-green-500', shadow: 'shadow-green-500/30' },
      blue: { bg: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
      amber: { bg: 'bg-amber-500', shadow: 'shadow-amber-500/30' },
      purple: { bg: 'bg-purple-500', shadow: 'shadow-purple-500/30' },
      pink: { bg: 'bg-pink-500', shadow: 'shadow-pink-500/30' },
    };
    return colorMap[color || 'blue'] || colorMap.blue;
  };

  const rotation = rotateAnimRef.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  if (variant === 'inline') {
    return (
        <Pressable
            onPress={handleMainPress}
            disabled={disabled || loading}
            className={`flex-row items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-600 py-3 px-4 ${
                disabled ? 'opacity-50' : 'active:bg-gray-100 dark:active:bg-gray-800'
            }`}
        >
          {loading ? (
              <ActivityIndicator size="small" color="#9ca3af" />
          ) : (
              <>
                <FontAwesome name={icon as any} size={14} color="#9ca3af" />
                {label && (
                    <Text className="ml-2 text-gray-500 dark:text-gray-400 text-sm">
                      {label}
                    </Text>
                )}
              </>
          )}
        </Pressable>
    );
  }

  // Floating variant with speed dial
  return (
      <View className="items-end">
        {/* Backdrop when expanded - animated dark overlay */}
        {expanded && (
            <Animated.View
                style={{
                  position: 'absolute',
                  top: -500,
                  left: -500,
                  right: -500,
                  bottom: -500,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  opacity: backdropOpacityRef.current,
                  zIndex: 0,
                }}
            >
              <Pressable
                  onPress={() => setExpanded(false)}
                  style={{ flex: 1 }}
              />
            </Animated.View>
        )}

        {/* Action options - Aumentado el tamaño */}
        {expanded && (
            <View className="mb-4 gap-3" style={{ zIndex: 1 }}>
              {options.map((option, index) => {
                const colorClasses = getColorClasses(option.color);
                const animation = animationsRef.current[index];

                if (!animation) return null;

                return (
                    <Animated.View
                        key={option.id}
                        style={{
                          transform: [{ scale: animation.scale }],
                          opacity: animation.opacity,
                        }}
                    >
                      <Pressable
                          onPress={() => handleOptionPress(option)}
                          disabled={option.disabled || option.loading}
                          className={`flex-row items-center justify-end ${
                              option.disabled ? 'opacity-50' : ''
                          }`}
                      >
                        {/* Label - más padding */}
                        <View className="mr-3 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
                          <Text
                              className="text-base font-medium text-gray-900 dark:text-gray-50"
                              numberOfLines={1}
                          >
                            {option.label}
                          </Text>
                        </View>

                        {/* Icon button - más grande */}
                        <View
                            className={`w-14 h-14 rounded-full items-center justify-center shadow-lg ${colorClasses.bg} ${colorClasses.shadow}`}
                        >
                          {option.loading ? (
                              <ActivityIndicator size="small" color="white" />
                          ) : (
                              <FontAwesome name={option.icon as any} size={20} color="white" />
                          )}
                        </View>
                      </Pressable>
                    </Animated.View>
                );
              })}
            </View>
        )}

        {/* Main FAB - Aumentado el tamaño */}
        <Animated.View style={{ transform: [{ rotate: rotation }], zIndex: 2 }}>
          <Pressable
              onPress={handleMainPress}
              disabled={disabled || loading}
              className={`w-16 h-16 rounded-full items-center justify-center shadow-xl bg-${floatingColor} ${
                  disabled ? 'opacity-50' : ''
              }`}
              style={{
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
          >
            {loading ? (
                <ActivityIndicator size="small" color="white" />
            ) : (
                <FontAwesome name={expanded ? 'times' : (icon as any)} size={26} color="white" />
            )}
          </Pressable>
        </Animated.View>
      </View>
  );
}
