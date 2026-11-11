
import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTema } from '../../contexts/themeContexts';

export default function TabsLayout() {
  const { tema, cores } = useTema();

  const modoEscuro = tema === 'escuro';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: cores.primario,
        tabBarInactiveTintColor: modoEscuro ? '#9CA3AF' : '#777777',

        tabBarStyle: {
          backgroundColor: cores.fundo,
          borderTopColor: cores.borda,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="todos"
        options={{
          title: 'Minha Lista',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="list-ul" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="diarios"
        options={{
          title: 'Diários',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="estatisticas"
        options={{
          title: 'Estatísticas',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="bar-chart" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
