import React from 'react';
import { View, Text, Image } from 'react-native';
import { useAuth } from '@/src/hooks/useAuth';

interface ProfileTabIconProps {
  color: string;
  focused: boolean;
}

export function ProfileTabIcon({ color, focused }: ProfileTabIconProps) {
  const { user } = useAuth();

  return (
    <View
      className={`w-7 h-7 rounded-full items-center justify-center overflow-hidden ${
        focused ? 'border-2' : 'border'
      }`}
      style={{
        borderColor: color,
        backgroundColor: user?.profilePicture ? 'transparent' : color,
      }}
    >
      {user?.profilePicture ? (
        <Image
          source={{ uri: user.profilePicture }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <Text
          className="font-semibold text-xs"
          style={{ color: '#FFFFFF' }}
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </Text>
      )}
    </View>
  );
}
