import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  // Resolve floatingColor to a hex value for style-based backgroundColor
  // Dynamic Tailwind classnames (bg-${var}) don't work with NativeWind
  const resolvedFloatingColor = (() => {
    const colorMap: Record<string, string> = {
      'primary-500': '#22C55E',
      'primary-600': '#16A34A',
      'amber-500': '#F59E0B',
      'amber-600': '#D97706',
      'green-500': '#22C55E',
      'green-600': '#16A34A',
      'red-500': '#EF4444',
      'red-600': '#DC2626',
      'blue-500': '#3B82F6',
      'blue-600': '#2563EB',
      'purple-500': '#8B5CF6',
      'purple-600': '#7C3AED',
    };
    return colorMap[floatingColor] || '#16A34A';
  })();

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

      // Animate options in with stagger (original spring animation)
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

  const handleOptionPress = useCallback((option: ActionOption) => {
    if (option.disabled || option.loading) return;
    setExpanded(false);
    // Execute immediately, no delay needed
    option.onPress();
  }, []);

  const getColorClasses = (color?: string): { bg: string; shadow: string; hex?: string } => {
    // Map named colors to hex — Tailwind dynamic classnames don't work reliably with NativeWind
    const hexMap: Record<string, string> = {
      primary: '#16A34A',
      green: '#22C55E',
      red: '#EF4444',
      blue: '#3B82F6',
      amber: '#F59E0B',
      purple: '#8B5CF6',
      pink: '#EC4899',
    };
    // Support hex colors directly
    if (color?.startsWith('#')) {
      return { bg: '', shadow: '', hex: color };
    }
    const hex = hexMap[color || 'blue'] || hexMap.blue;
    return { bg: '', shadow: '', hex };
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
                    <Pressable
                        key={option.id}
                        onPress={() => handleOptionPress(option)}
                        disabled={option.disabled || option.loading}
                        className={`flex-row items-center justify-end ${
                            option.disabled ? 'opacity-50' : ''
                        }`}
                    >
                      {/* Animated wrapper is inside Pressable — scale is visual only, touch target stays full-size */}
                      <Animated.View
                          style={{
                            transform: [{ scale: animation.scale }],
                            opacity: animation.opacity,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                      >
                        {/* Label */}
                        <View className="mr-3 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
                          <Text
                              className="text-base font-medium text-gray-900 dark:text-gray-50"
                              numberOfLines={1}
                          >
                            {option.label}
                          </Text>
                        </View>

                        {/* Icon button */}
                        <View
                            className="w-14 h-14 rounded-full items-center justify-center shadow-lg"
                            style={{ backgroundColor: colorClasses.hex, shadowColor: colorClasses.hex }}
                        >
                          {option.loading ? (
                              <ActivityIndicator size="small" color="white" />
                          ) : (
                              <FontAwesome name={option.icon as any} size={20} color="white" />
                          )}
                        </View>
                      </Animated.View>
                    </Pressable>
                );
              })}
            </View>
        )}

        {/* Main FAB - Aumentado el tamaño */}
        <View className="flex-row items-center">
          {/* Label pill for single-action FAB */}
          {label && options.length === 1 && !expanded && (
            <Pressable
              onPress={handleMainPress}
              disabled={disabled || loading}
              className="mr-3 px-4 py-2.5 rounded-full bg-white dark:bg-gray-800 shadow-lg"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Text className="text-sm font-semibold text-gray-900 dark:text-gray-50" numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          )}
          <Animated.View style={{ transform: [{ rotate: rotation }], zIndex: 2 }}>
            <Pressable
                onPress={handleMainPress}
                disabled={disabled || loading}
                className={`w-16 h-16 rounded-full items-center justify-center shadow-xl ${
                    disabled ? 'opacity-50' : ''
                }`}
                style={{
                  backgroundColor: resolvedFloatingColor,
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
      </View>
  );
}
