import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { IconButton } from './IconButton';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
  showOkButton?: boolean;
  okLabel?: string;
  onOk?: () => void;
  headerActions?: React.ReactNode;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 100;
const OPEN_DURATION = 280;
const CLOSE_DURATION = 200;

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
  headerActions,
}: BottomSheetProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const isClosing = useRef(false);
  const onCloseRef = useRef(onClose);
  const onOkRef = useRef(onOk);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { onOkRef.current = onOk; }, [onOk]);

  // Open / close animation
  useEffect(() => {
    if (visible) {
      isClosing.current = false;
      setIsReady(false);
      setModalVisible(true);
      backdropOpacity.setValue(0);
      slideAnim.setValue(SCREEN_HEIGHT);

      // Small delay on Android to let the Modal fully mount its touch layer
      const delay = Platform.OS === 'android' ? 50 : 0;
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: OPEN_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: OPEN_DURATION,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsReady(true);
        });
      }, delay);

      return () => clearTimeout(timer);
    } else if (modalVisible && !isClosing.current) {
      isClosing.current = true;
      setIsReady(false);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: CLOSE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: CLOSE_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
        isClosing.current = false;
      });
    }
  }, [visible]);

  const animateClose = useCallback((callback: () => void) => {
    if (isClosing.current) return;
    isClosing.current = true;
    setIsReady(false);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: CLOSE_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: CLOSE_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      isClosing.current = false;
      callback();
    });
  }, [backdropOpacity, slideAnim]);

  const handleClose = useCallback(() => {
    animateClose(() => onCloseRef.current());
  }, [animateClose]);

  // PanResponder — only attached to the drag handle, not header buttons
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SWIPE_THRESHOLD || gestureState.vy > 0.5) {
          if (isClosing.current) return;
          isClosing.current = true;
          Animated.parallel([
            Animated.timing(backdropOpacity, {
              toValue: 0,
              duration: CLOSE_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: SCREEN_HEIGHT,
              duration: CLOSE_DURATION,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setModalVisible(false);
            isClosing.current = false;
            onCloseRef.current();
          });
        } else {
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

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1 justify-end"
      >
        {/* Backdrop */}
        <Animated.View
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/40"
          style={{ opacity: backdropOpacity }}
        >
          <Pressable className="flex-1" onPress={handleClose} />
        </Animated.View>

        {/* Sheet content */}
        <Animated.View
          className="rounded-t-3xl max-h-[80%] bg-white dark:bg-gray-800 overflow-hidden"
          style={{ transform: [{ translateY: slideAnim }] }}
        >
          {/* Drag handle — only this area has PanResponder */}
          {showHandle && (
            <View {...panResponder.panHandlers}>
              <View className="items-center pt-3 pb-2">
                <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              </View>
            </View>
          )}

          {/* Header with title + action buttons — NO PanResponder, touches pass through immediately */}
          {(title || showCloseButton || showOkButton) && (
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">{title || ''}</Text>
              <View className="flex-row items-center gap-2">
                {headerActions}
                {showOkButton ? (
                  <Pressable
                    onPress={onOk || handleClose}
                    className="px-4 py-1.5 bg-primary-500 rounded-full active:bg-primary-600"
                  >
                    <Text className="text-white font-medium text-sm">{okLabel}</Text>
                  </Pressable>
                ) : showCloseButton ? (
                  <IconButton icon="chevron-down" variant="ghost" size="sm" onPress={handleClose} />
                ) : null}
              </View>
            </View>
          )}

          {/* Content */}
          <ScrollView
            className="px-4 py-4"
            keyboardShouldPersistTaps="handled"
            pointerEvents={isReady ? 'auto' : 'box-none'}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
