import { useColorScheme } from '@/hooks/use-color-scheme';
import { Bell } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CustomHeader() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const iconColor = colorScheme === 'dark' ? '#9CA3AF' : '#6B7280';

  const handleNotifications = () => {
    // TODO: Navigate to notifications screen (future implementation)
    console.log('Navigate to notifications');
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

        {/* Notifications */}
        <Pressable
          onPress={handleNotifications}
          className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800"
          accessibilityRole="button"
          accessibilityLabel="Notificações"
        >
          <Bell size={22} color={iconColor} />
        </Pressable>
      </View>
    </View>
  );
}
