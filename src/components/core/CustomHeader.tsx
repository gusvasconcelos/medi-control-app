import { useAuth } from '@/src/hooks/useAuth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Bell } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CustomHeader() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const iconColor = colorScheme === 'dark' ? '#9CA3AF' : '#6B7280';

  const handleNotifications = () => {
    // TODO: Navigate to notifications screen
    console.log('Navigate to notifications');
  };

  const handleProfile = () => {
    // TODO: Navigate to profile screen
    console.log('Navigate to profile');
  };

  return (
    <View
      className="bg-background dark:bg-dark-background border-b border-border dark:border-dark-border"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between px-4 py-3">
        {/* Logo */}
        <View>
          <Text className="text-xl font-bold text-primary">MediControl</Text>
        </View>

      {/* Right side: Notifications + Profile */}
      <View className="flex-row items-center gap-3">
        {/* Notifications */}
        <Pressable
          onPress={handleNotifications}
          className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800"
        >
          <Bell size={22} color={iconColor} />
        </Pressable>

        {/* Profile Picture */}
        <Pressable
          onPress={handleProfile}
          className="w-9 h-9 rounded-full bg-primary items-center justify-center overflow-hidden"
        >
          {user?.profilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          )}
        </Pressable>
      </View>
      </View>
    </View>
  );
}
