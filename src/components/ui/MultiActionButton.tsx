import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator, BackHandler, Animated, Modal, useColorScheme, Dimensions } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

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
  menuPosition?: 'top' | 'bottom';
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
  floatingColor = 'primary-500',
}: MultiActionButtonProps) {
  const [expanded, setExpanded] = useState(false);
  const [buttonLayout, setButtonLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const buttonRef = useRef<View>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Create animations based on current options length
  const optionAnims = useMemo(() => {
    return options.map(() => ({
      scale: new Animated.Value(0),
      translate: new Animated.Value(30),
    }));
  }, [options.length]);

  // Measure button position when expanded
  useEffect(() => {
    if (expanded && buttonRef.current) {
      // Small delay to ensure accurate measurement after render
      setTimeout(() => {
        buttonRef.current?.measureInWindow((x, y, width, height) => {
          setButtonLayout({ x, y, width, height });
        });
      }, 50);
    }
  }, [expanded]);

  // Handle Android back button
  useEffect(() => {
    if (expanded) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        handleClose();
        return true;
      });
      return () => backHandler.remove();
    }
  }, [expanded]);

  // Animate on expand
  useEffect(() => {
    if (expanded) {
      // Reset animations first
      optionAnims.forEach(anim => {
        anim.scale.setValue(0);
        anim.translate.setValue(30);
      });

      // Fade in backdrop
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Animate options from bottom to top with stagger
      const animations = optionAnims.map((anim, index) => {
        const delay = (optionAnims.length - 1 - index) * 40;
        return Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1,
            tension: 120,
            friction: 8,
            delay,
            useNativeDriver: true,
          }),
          Animated.spring(anim.translate, {
            toValue: 0,
            tension: 120,
            friction: 8,
            delay,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.parallel(animations).start();
    }
  }, [expanded, optionAnims]);

  const handleClose = () => {
    // Animate close
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();

    // Animate options out
    const animations = optionAnims.map((anim, index) =>
      Animated.parallel([
        Animated.timing(anim.scale, {
          toValue: 0,
          duration: 100,
          delay: index * 20,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translate, {
          toValue: 30,
          duration: 100,
          delay: index * 20,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel(animations).start(() => {
      setExpanded(false);
      setButtonLayout(null);
    });
  };

  const handleMainPress = () => {
    if (options.length === 1) {
      options[0].onPress();
    } else {
      setExpanded(true);
    }
  };

  const handleOptionPress = (option: ActionOption) => {
    if (option.disabled || option.loading) return;
    handleClose();
    setTimeout(() => option.onPress(), 150);
  };

  const getColorClass = (color?: string) => {
    const colors: Record<string, string> = {
      red: 'bg-red-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      amber: 'bg-amber-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
      primary: 'bg-primary-500',
    };
    return colors[color || 'primary'] || colors.primary;
  };

  const getFloatingColorClass = () => `bg-${floatingColor}`;

  // Calculate positions for modal content based on button layout
  const getModalPositions = () => {
    if (!buttonLayout) return { bottom: 24, right: 24 };

    // Calculate from bottom and right edges for more reliable positioning
    const bottomFromEdge = SCREEN_HEIGHT - buttonLayout.y - buttonLayout.height;
    const rightFromEdge = SCREEN_WIDTH - buttonLayout.x - buttonLayout.width;

    // Ensure minimum spacing from edges
    const bottom = Math.max(16, bottomFromEdge);
    const right = Math.max(16, rightFromEdge);

    return { bottom, right };
  };

  const positions = getModalPositions();

  return (
    <>
      {/* Main Button */}
      <View ref={buttonRef} collapsable={false}>
        {variant === 'inline' ? (
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
        ) : (
          <Pressable
            onPress={handleMainPress}
            disabled={disabled || loading}
            className={`w-14 h-14 rounded-full items-center justify-center shadow-lg ${getFloatingColorClass()} ${
              disabled ? 'opacity-50' : ''
            }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <FontAwesome name={icon as any} size={24} color="white" />
            )}
          </Pressable>
        )}
      </View>

      {/* Modal with overlay and options */}
      {expanded && buttonLayout && (
        <Modal visible transparent animationType="none" onRequestClose={handleClose}>
          <View className="flex-1">
            {/* Backdrop */}
            <Animated.View
              className="absolute inset-0 bg-black/50"
              style={{ opacity: fadeAnim }}
            >
              <Pressable className="flex-1" onPress={handleClose} />
            </Animated.View>

            {/* Options positioned above the button */}
            <View
              style={{
                position: 'absolute',
                bottom: positions.bottom + 24,
                right: positions.right,
                alignItems: 'flex-end',
              }}
            >
              {options.map((option, index) => (
                <Animated.View
                  key={option.id}
                  className="mb-3 flex-row items-center"
                  style={{
                    transform: [
                      { scale: optionAnims[index]?.scale || 1 },
                      { translateY: optionAnims[index]?.translate || 0 },
                    ],
                    opacity: optionAnims[index]?.scale || 1,
                  }}
                >
                  <Pressable
                    onPress={() => handleOptionPress(option)}
                    disabled={option.disabled || option.loading}
                    className={`flex-row items-center ${option.disabled ? 'opacity-50' : ''}`}
                  >
                    <View className={`rounded-lg px-3 py-2 mr-3 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                      <Text
                        className={`font-medium text-sm ${isDark ? 'text-gray-50' : 'text-gray-900'}`}
                        numberOfLines={1}
                      >
                        {option.label}
                      </Text>
                    </View>
                    <View className={`w-11 h-11 rounded-full items-center justify-center shadow-lg ${getColorClass(option.color)}`}>
                      {option.loading ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <FontAwesome name={option.icon as any} size={18} color="white" />
                      )}
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>

            {/* Close button at same position as main FAB */}
            <View
              style={{
                position: 'absolute',
                bottom: positions.bottom -36,
                right: positions.right,
              }}
            >
              <Pressable
                onPress={handleClose}
                className={`w-14 h-14 rounded-full items-center justify-center shadow-lg ${isDark ? 'bg-gray-700' : 'bg-gray-500'}`}
              >
                <FontAwesome name="times" size={24} color="white" />
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}
