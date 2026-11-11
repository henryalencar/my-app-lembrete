
import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../contexts/themeContexts';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lembrete" />
      </Stack>
    </ThemeProvider>
  );
}
