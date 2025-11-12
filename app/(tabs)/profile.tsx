import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/src/hooks/useAuth';
import { LogOut, Mail, User as UserIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const iconColor = colorScheme === 'dark' ? '#9CA3AF' : '#6B7280';

  const handleEditProfile = () => {
    // TODO: Implement edit profile functionality
    console.log('Edit profile');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await signOut();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <View className="items-center pt-8 pb-6">
          <View className="w-24 h-24 rounded-full bg-primary items-center justify-center overflow-hidden mb-4">
            {user.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-white font-bold text-4xl">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            )}
          </View>
          <Text className="text-2xl font-bold text-foreground dark:text-dark-foreground mb-1">
            {user.name}
          </Text>
          <Text className="text-base text-muted-foreground dark:text-dark-muted-foreground">
            {user.email}
          </Text>
        </View>

        {/* Profile Information Cards */}
        <View className="px-4 gap-4">
          {/* Personal Information */}
          <View className="bg-white dark:bg-dark-card rounded-xl border border-border dark:border-dark-border p-4">
            <Text className="text-lg font-semibold text-foreground dark:text-dark-foreground mb-4">
              Informações Pessoais
            </Text>

            {/* Name */}
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
                <UserIcon size={20} color={iconColor} />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground dark:text-dark-muted-foreground mb-1">
                  Nome
                </Text>
                <Text className="text-base text-foreground dark:text-dark-foreground">
                  {user.name || 'Não informado'}
                </Text>
              </View>
            </View>

            {/* Email */}
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
                <Mail size={20} color={iconColor} />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground dark:text-dark-muted-foreground mb-1">
                  Email
                </Text>
                <Text className="text-base text-foreground dark:text-dark-foreground">
                  {user.email || 'Não informado'}
                </Text>
              </View>
            </View>
          </View>

          {/* Account Information */}
          <View className="bg-white dark:bg-dark-card rounded-xl border border-border dark:border-dark-border p-4">
            <Text className="text-lg font-semibold text-foreground dark:text-dark-foreground mb-4">
              Informações da Conta
            </Text>

            {/* Creation Date */}
            {user.createdAt && (
              <View>
                <Text className="text-sm text-muted-foreground dark:text-dark-muted-foreground mb-1">
                  Membro desde
                </Text>
                <Text className="text-base text-foreground dark:text-dark-foreground">
                  {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}
          </View>

          {/* Logout Button */}
          <View className="bg-white dark:bg-dark-card rounded-xl border border-border dark:border-dark-border p-4">
            <Pressable
              onPress={handleLogout}
              disabled={isLoggingOut}
              className={`flex-row items-center justify-center gap-3 py-3 rounded-lg ${
                isLoggingOut
                  ? 'bg-gray-300 dark:bg-gray-700'
                  : 'bg-red-600 dark:bg-red-700 active:bg-red-700 dark:active:bg-red-800'
              }`}
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <LogOut size={20} color="#FFFFFF" />
                  <Text className="text-base font-semibold text-white">
                    Sair
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
