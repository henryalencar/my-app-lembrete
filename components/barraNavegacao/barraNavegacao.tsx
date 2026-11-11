
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type Props = {
  telaAtiva: 'home' | 'todos' | 'diarios';
  onNavegar: (tela: 'home' | 'todos' | 'diarios') => void;
};

export default function BarraNavegacao({
  telaAtiva,
  onNavegar,
}: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => onNavegar('home')}
      >
        <FontAwesome
          name="home"
          size={22}
          color={telaAtiva === 'home' ? '#2563EB' : '#777'}
        />
        <Text style={[
          styles.texto,
          telaAtiva === 'home' && styles.ativo,
        ]}>
          Início
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => onNavegar('todos')}
      >
        <FontAwesome
          name="list-ul"
          size={22}
          color={telaAtiva === 'todos' ? '#2563EB' : '#777'}
        />
        <Text style={[
          styles.texto,
          telaAtiva === 'todos' && styles.ativo,
        ]}>
          Minha Lista
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => onNavegar('diarios')}
      >
        <FontAwesome
          name="calendar"
          size={22}
          color={telaAtiva === 'diarios' ? '#2563EB' : '#777'}
        />
        <Text style={[
          styles.texto,
          telaAtiva === 'diarios' && styles.ativo,
        ]}>
          Diários
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    flex: 1,
  },
  texto: {
    fontSize: 11,
    color: '#777',
  },
  ativo: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
});
