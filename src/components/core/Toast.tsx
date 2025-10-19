import { Colors } from '@/src/constants/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: (id: string) => void;
}

const TOAST_COLORS = {
  success: {
    background: '#10B981',
    border: '#059669',
    icon: 'check-circle' as const,
  },
  error: {
    background: Colors.destructive.DEFAULT,
    border: '#DC2626',
    icon: 'error' as const,
  },
  info: {
    background: Colors.primary.DEFAULT,
    border: '#0284C7',
    icon: 'info' as const,
  },
  warning: {
    background: '#F59E0B',
    border: '#D97706',
    icon: 'warning' as const,
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = 'success',
  duration = 4000,
  onDismiss,
}) => {
  const slideAnim = React.useRef(new Animated.Value(100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation from bottom
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.(id);
    });
  };

  const colors = TOAST_COLORS[type];

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
        marginTop: 8,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleDismiss}
        style={{
          backgroundColor: colors.background,
          borderLeftWidth: 4,
          borderLeftColor: colors.border,
          borderRadius: 12,
          padding: 16,
          paddingRight: 12,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <MaterialIcons name={colors.icon} size={24} color="white" />
        <Text
          style={{
            flex: 1,
            marginLeft: 12,
            color: 'white',
            fontSize: 14,
            fontWeight: '600',
            lineHeight: 20,
          }}
        >
          {message}
        </Text>
        <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="close" size={20} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};
