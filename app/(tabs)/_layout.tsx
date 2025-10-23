import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="calendar"
        options={{
          title: 'Calendário',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-medication"
        options={{
          presentation: 'modal',
          title: 'Adicionar Medicamento',
          headerShown: true,
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack>
  );
}
