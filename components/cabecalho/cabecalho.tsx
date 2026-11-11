
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type Props = {
  titulo: string;
  onVoltar: () => void;
};

export default function Cabecalho({ titulo, onVoltar }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onVoltar} style={styles.voltar}>
        <FontAwesome name="angle-left" size={28} color="#111" />
      </TouchableOpacity>

      <Text style={styles.titulo}>{titulo}</Text>

      <View style={styles.espaco} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voltar: {
    width: 40,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  espaco: {
    width: 40,
  },
});
