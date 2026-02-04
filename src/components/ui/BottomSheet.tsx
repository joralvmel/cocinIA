import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Animated, PanResponder, Dimensions } from 'react-native';
import { IconButton } from './IconButton';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
  /** Show OK button instead of X button */
  showOkButton?: boolean;
  /** Label for OK button */
  okLabel?: string;
  /** Called when OK button is pressed */
  onOk?: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 100;

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  showHandle = true,
  showCloseButton = true,
  showOkButton = false,
  okLabel = 'OK',
  onOk,
}: BottomSheetProps) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward swipes
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging down
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SWIPE_THRESHOLD || gestureState.vy > 0.5) {
          // Close if swiped down enough or with enough velocity
          handleClose();
        } else {
          // Snap back to open position
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      backdropOpacity.setValue(0);
      slideAnim.setValue(300);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Animated.View
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/40"
          style={{ opacity: backdropOpacity }}
        >
          <Pressable className="flex-1" onPress={handleClose} />
        </Animated.View>

        {/* Sheet content */}
        <Animated.View
          className="rounded-t-3xl max-h-[80%] bg-white dark:bg-gray-800"
          style={{ transform: [{ translateY: slideAnim }] }}
        >
          {/* Drag handle area */}
          <View {...panResponder.panHandlers}>
            {showHandle && (
              <View className="items-center pt-3 pb-2">
                <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              </View>
            )}
            {(title || showCloseButton || showOkButton) && (
              <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                {title ? (
                  <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">{title}</Text>
                ) : (
                  <View />
                )}
                {showOkButton ? (
                  <Pressable
                    onPress={onOk || handleClose}
                    className="px-4 py-1.5 bg-primary-500 rounded-full active:bg-primary-600"
                  >
                    <Text className="text-white font-medium text-sm">{okLabel}</Text>
                  </Pressable>
                ) : showCloseButton ? (
                  <IconButton icon="times" variant="ghost" size="sm" onPress={handleClose} />
                ) : null}
              </View>
            )}
          </View>
          <ScrollView className="px-4 py-4">{children}</ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
