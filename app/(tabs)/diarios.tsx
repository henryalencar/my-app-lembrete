
import React, { useCallback } from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

import { useLembrete } from '../../hooks/useLembrete';
import { useTema } from '../../contexts/themeContexts';
import CartaoLembrete from '../../components/cartaoLembrete/cartaoLembrete';

export default function Diarios() {
  const router = useRouter();
  const { cores } = useTema();

  const {
    lembretes,
    carregando,
    concluir,
    carregarLembretes,
  } = useLembrete();

  useFocusEffect(
    useCallback(() => {
      carregarLembretes();
    }, [carregarLembretes])
  );

  function confirmarConclusao(id: string) {
    Alert.alert(
      'Concluir lembrete diário?',
      'Ao confirmar, este lembrete será marcado como concluído e um novo lembrete será criado automaticamente para amanhã, no mesmo horário.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await concluir(id);
            } catch (erro) {
              Alert.alert(
                'Erro',
                'Não foi possível concluir o lembrete. Tente novamente.'
              );
            }
          },
        },
      ]
    );
  }

  // Mostra somente os lembretes diários pendentes
  const diarios = [...lembretes]
    .filter((item) => item.diario && !item.concluido)
    .sort((a, b) => {
      const dataA = `${a.data} ${a.horario}`;
      const dataB = `${b.data} ${b.horario}`;

      return dataA.localeCompare(dataB);
    });

  return (
    <View
      style={[
        styles.tela,
        { backgroundColor: cores.fundo },
      ]}
    >
      

      <View style={styles.cabecalho}>
        <View>
          <Text
            style={[
              styles.pequenoTexto,
              { color: cores.textoSecundario },
            ]}
          >
            SUA ROTINA
          </Text>

          <Text
            style={[
              styles.titulo,
              { color: cores.texto },
            ]}
          >
            Diários
          </Text>

          <Text
            style={[
              styles.subtitulo,
              { color: cores.textoSecundario },
            ]}
          >
            Atividades que fazem parte do seu dia a dia.
          </Text>
        </View>

        <View
          style={[
            styles.icone,
            { backgroundColor: cores.cartao },
          ]}
        >
          <FontAwesome
            name="refresh"
            size={23}
            color={cores.primario}
          />
        </View>
      </View>

     

      <View
        style={[
          styles.informacao,
          { backgroundColor: cores.cartao }
        ]}
      >
        <FontAwesome
          name="info-circle"
          size={17}
          color={cores.primario}
        />

        <Text
          style={[
            styles.informacaoTexto,
            { color: cores.texto },
          ]}
        >
          Seus lembretes recorrentes aparecem nesta lista. Ao concluir um,
          a próxima ocorrência será criada automaticamente para amanhã.
        </Text>
      </View>

    

      <FlatList
        data={diarios}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshing={carregando}
        onRefresh={carregarLembretes}
        renderItem={({ item }) => (
          <CartaoLembrete
            lembrete={item}
            onPress={() => router.push(`/lembrete/${item.id}`)}
            onConcluir={() => confirmarConclusao(item.id)}
          />
        )}
        ListEmptyComponent={
          <View
            style={[
              styles.vazio,
              {
                backgroundColor: cores.superficie,
                borderColor: cores.borda,
              },
            ]}
          >
            <FontAwesome
              name="calendar-o"
              size={45}
              color={cores.primario}
            />

            <Text
              style={[
                styles.vazioTitulo,
                { color: cores.texto },
              ]}
            >
              Nenhum lembrete diário
            </Text>

            <Text
              style={[
                styles.vazioDescricao,
                { color: cores.textoSecundario },
              ]}
            >
              Ative a opção "Repetir diariamente" ao criar um lembrete.
            </Text>

            <TouchableOpacity
              style={[
                styles.botao,
                { backgroundColor: cores.primario },
              ]}
              onPress={() => router.push('/lembrete/novo')}
              activeOpacity={0.85}
            >
              <FontAwesome
                name="plus"
                size={14}
                color="#FFFFFF"
              />

              <Text style={styles.botaoTexto}>
                Criar lembrete
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    paddingTop: 45,
  },

  cabecalho: {
    paddingHorizontal: 22,
    paddingBottom: 23,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pequenoTexto: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },

  subtitulo: {
    fontSize: 12,
    marginTop: 5,
  },

  icone: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  informacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 22,
  },

  informacaoTexto: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  lista: {
    paddingHorizontal: 18,
    paddingBottom: 25,
    flexGrow: 1,
  },

  vazio: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 25,
  },

  vazioTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 15,
  },

  vazioDescricao: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 22,
  },

  botaoTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
