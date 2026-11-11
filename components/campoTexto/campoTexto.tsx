
import React from 'react';

import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  Text,
} from 'react-native';

import { useTema } from '../../contexts/themeContexts';

type Props = TextInputProps & {
  label: string;
};

export default function CampoTexto({ label, ...props }: Props) {
  const { cores } = useTema();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: cores.texto }]}>
        {label}
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: cores.campo,
            color: cores.texto,
            borderColor: cores.borda,
          },
        ]}
        placeholderTextColor={cores.textoSecundario}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 16,
    borderWidth: 1,
  },
});
