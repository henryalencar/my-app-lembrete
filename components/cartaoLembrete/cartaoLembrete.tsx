
import React, { useRef, useEffect } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

import { FontAwesome } from '@expo/vector-icons';

import { Lembrete, Prioridade } from '../../types/lembrete';
import { useTema } from '../../contexts/themeContexts';

type Props = {
  lembrete: Lembrete;
  onPress: () => void;
  onConcluir: () => void;
};

const configuracaoPrioridade: Record<
  Prioridade,
  {
    nome: string;
    cor: string;
    fundo: string;
    icone: 'arrow-down' | 'minus' | 'arrow-up';
  }
> = {
  baixa: {
    nome: 'Baixa',
    cor: '#16A34A',
    fundo: '#DCFCE7',
    icone: 'arrow-down',
  },
  media: {
    nome: 'Média',
    cor: '#CA8A04',
    fundo: '#FEF9C3',
    icone: 'minus',
  },
  alta: {
    nome: 'Alta',
    cor: '#EF4444',
    fundo: '#FEE2E2',
    icone: 'arrow-up',
  },
};

export default function CartaoLembrete({
  lembrete,
  onPress,
  onConcluir,
}: Props) {
  const { cores } = useTema();

  // CONFIGURAÇÃO DA PRIORIDADE
  const prioridade = configuracaoPrioridade[
    lembrete.prioridade ?? 'media'
  ];

  // ANIMAÇÃO DE PRESSÃO DO CARD
  const escala = useRef(new Animated.Value(1)).current;

  // ANIMAÇÃO DE CONCLUSÃO
  const animacaoConclusao = useRef(
    new Animated.Value(lembrete.concluido ? 1 : 0)
  ).current;

  // ATUALIZA A ANIMAÇÃO QUANDO O STATUS MUDA
  useEffect(() => {
    Animated.timing(animacaoConclusao, {
      toValue: lembrete.concluido ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [lembrete.concluido, animacaoConclusao]);

  // ANIMAÇÃO AO PRESSIONAR
  function pressionar() {
    Animated.spring(escala, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  }

  // ANIMAÇÃO AO SOLTAR
  function soltar() {
    Animated.spring(escala, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  }

  // ESCALA DO ÍCONE DE CONCLUSÃO
  const escalaCheck = animacaoConclusao.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.15],
  });

  // OPACIDADE DO ÍCONE
  const opacidadeCheck = animacaoConclusao.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  // OPACIDADE DO TÍTULO
  const opacidadeTitulo = animacaoConclusao.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.containerAnimado,
        {
          transform: [{ scale: escala }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.cartao,
          {
            backgroundColor: cores.cartao,
            borderColor: cores.borda,
          },
        ]}
        onPress={onPress}
        onPressIn={pressionar}
        onPressOut={soltar}
        activeOpacity={1}
      >
        <TouchableOpacity
          style={styles.check}
          onPress={onConcluir}
          activeOpacity={0.7}
        >
          <Animated.View
            style={{
              transform: [{ scale: escalaCheck }],
              opacity: opacidadeCheck,
            }}
          >
            <FontAwesome
              name={
                lembrete.concluido
                  ? 'check-circle'
                  : 'circle-o'
              }
              size={23}
              color={
                lembrete.concluido
                  ? cores.primario
                  : cores.textoSecundario
              }
            />
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.conteudo}>
          <Animated.Text
            style={[
              styles.titulo,
              {
                color: cores.texto,
                textDecorationLine: lembrete.concluido
                  ? 'line-through'
                  : 'none',
                opacity: opacidadeTitulo,
              },
            ]}
            numberOfLines={2}
          >
            {lembrete.titulo}
          </Animated.Text>

          <View style={styles.informacoes}>
            <FontAwesome
              name="clock-o"
              size={12}
              color={cores.textoSecundario}
            />

            <Text
              style={[
                styles.horario,
                { color: cores.textoSecundario },
              ]}
            >
              {lembrete.data} • {lembrete.horario}
            </Text>
          </View>

          {/* ETIQUETAS */}
          <View style={styles.etiquetas}>

            {/* PRIORIDADE */}
            <View
              style={[
                styles.etiquetaPrioridade,
                {
                  backgroundColor: prioridade.fundo,
                  borderColor: prioridade.cor,
                },
              ]}
            >
              <FontAwesome
                name={prioridade.icone}
                size={10}
                color={prioridade.cor}
              />

              <Text
                style={[
                  styles.textoPrioridade,
                  { color: prioridade.cor },
                ]}
              >
                {prioridade.nome}
              </Text>
            </View>

            {/* LEMBRETE DIÁRIO */}
            {lembrete.diario && (
              <View
                style={[
                  styles.etiquetaDiario,
                  {
                    backgroundColor: cores.cartao,
                    borderColor: cores.primario,
                  },
                ]}
              >
                <FontAwesome
                  name="refresh"
                  size={10}
                  color={cores.primario}
                />

                <Text
                  style={[
                    styles.textoDiario,
                    { color: cores.primario },
                  ]}
                >
                  Diário
                </Text>
              </View>
            )}

          </View>
        </View>

        <FontAwesome
          name="angle-right"
          size={22}
          color={cores.textoSecundario}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  containerAnimado: {
    width: '100%',
  },

  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
  },

  check: {
    marginRight: 13,
    paddingVertical: 5,
  },

  conteudo: {
    flex: 1,
  },

  titulo: {
    fontSize: 16,
    fontWeight: '600',
  },

  informacoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },

  horario: {
    fontSize: 12,
  },

  etiquetas: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 8,
  },

  etiquetaPrioridade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },

  textoPrioridade: {
    fontSize: 10,
    fontWeight: '700',
  },

  etiquetaDiario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },

  textoDiario: {
    fontSize: 10,
    fontWeight: '600',
  },
});
