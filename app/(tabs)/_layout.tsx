import { useColorScheme } from '@/hooks/use-color-scheme';
import { CustomHeader } from '@/src/components';
import { Tabs } from 'expo-router';
import { Calendar, PlusCircle } from 'lucide-react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        header: () => <CustomHeader />,
        tabBarActiveTintColor: '#0D7FFF',
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
        tabBarStyle: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
          borderTopWidth: 1,
          height: 40 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hidden from tab bar - will be opened as modal
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendário',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-medication"
        options={{
          title: 'Adicionar',
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
          href: null, // Hidden from tab bar - will be opened as modal
        }}
      />
    </Tabs>
  );
}
