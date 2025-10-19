import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'transparent',
        },
      }}
    >
      <Stack.Screen
        name="auth"
        options={{
          title: 'Authentication',
        }}
      />
    </Stack>
  );
}
