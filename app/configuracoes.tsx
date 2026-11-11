
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';

import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  useTema,
  opcoesCores,
  CorDestaque,
} from '../contexts/themeContexts';

export default function Configuracoes() {
  const router = useRouter();

  const {
    tema,
    cores,
    corDestaque,
    alterarCorPrimaria,
    alternarTema,
  } = useTema();

  const modoEscuro = tema === 'escuro';

  return (
    <ScrollView
      style={[
        styles.tela,
        { backgroundColor: cores.fundo },
      ]}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      
      <View style={styles.cabecalho}>
        <TouchableOpacity
          style={[
            styles.botaoVoltar,
            { backgroundColor: cores.superficie },
          ]}
          onPress={() => router.back()}
        >
          <FontAwesome
            name="angle-left"
            size={25}
            color={cores.texto}
          />
        </TouchableOpacity>

        <View style={styles.tituloContainer}>
          <Text style={[styles.titulo, { color: cores.texto }]}>
            Configurações
          </Text>

          <Text
            style={[
              styles.subtitulo,
              { color: cores.textoSecundario },
            ]}
          >
            Personalize seu aplicativo
          </Text>
        </View>
      </View>

     

      <Text style={[styles.secaoTitulo, { color: cores.texto }]}>
        Aparência
      </Text>

      <View
        style={[
          styles.cartao,
          { backgroundColor: cores.superficie },
        ]}
      >
        <View style={styles.item}>
          <View style={styles.itemIcone}>
            <FontAwesome
              name={modoEscuro ? 'moon-o' : 'sun-o'}
              size={21}
              color={cores.primario}
            />
          </View>

          <View style={styles.itemTexto}>
            <Text style={[styles.itemTitulo, { color: cores.texto }]}>
              Modo escuro
            </Text>

            <Text
              style={[
                styles.itemDescricao,
                { color: cores.textoSecundario },
              ]}
            >
              {modoEscuro ? 'Ativado' : 'Desativado'}
            </Text>
          </View>

          <Switch
            value={modoEscuro}
            onValueChange={alternarTema}
            trackColor={{
              false: '#CBD5E1',
              true: cores.primario,
            }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      

      <Text style={[styles.secaoTitulo, { color: cores.texto }]}>
        Personalização
      </Text>

      <View
        style={[
          styles.cartao,
          styles.cartaoCores,
          { backgroundColor: cores.superficie },
        ]}
      >
        <Text style={[styles.itemTitulo, { color: cores.texto }]}>
          Cor de destaque
        </Text>

        <Text
          style={[
            styles.itemDescricao,
            styles.descricaoCores,
            { color: cores.textoSecundario },
          ]}
        >
          Escolha a cor que combina com você.
        </Text>

        <View style={styles.gradeCores}>
          {opcoesCores.map((item) => {
            const selecionada = corDestaque === item.id;

            const corVisual = modoEscuro
              ? item.escuro
              : item.claro;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.opcaoCor}
                onPress={() =>
                  alterarCorPrimaria(item.id as CorDestaque)
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.circuloCor,
                    {
                      backgroundColor: corVisual,
                      borderColor: selecionada
                        ? cores.texto
                        : 'transparent',
                    },
                    selecionada && styles.corSelecionada,
                  ]}
                >
                  {selecionada && (
                    <FontAwesome
                      name="check"
                      size={17}
                      color="#FFFFFF"
                    />
                  )}
                </View>

                <Text
                  style={[
                    styles.nomeCor,
                    {
                      color: selecionada
                        ? cores.texto
                        : cores.textoSecundario,
                      fontWeight: selecionada ? 'bold' : 'normal',
                    },
                  ]}
                >
                  {item.nome}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

       

        <View
          style={[
            styles.previa,
            {
              backgroundColor: cores.cartao,
              borderColor: cores.borda,
            },
          ]}
        >
          <Text
            style={[
              styles.previaTitulo,
              { color: cores.texto },
            ]}
          >
            Prévia da personalização
          </Text>

          <TouchableOpacity
            style={[
              styles.botaoPrevia,
              { backgroundColor: cores.primario },
            ]}
            activeOpacity={1}
          >
            <FontAwesome
              name="check"
              size={14}
              color="#FFFFFF"
            />

            <Text style={styles.textoBotaoPrevia}>
              Botão de exemplo
            </Text>
          </TouchableOpacity>
        </View>
      </View>

  

      <Text style={[styles.secaoTitulo, { color: cores.texto }]}>
        Sobre
      </Text>

      <View
        style={[
          styles.cartao,
          { backgroundColor: cores.superficie },
        ]}
      >
        <View style={styles.item}>
          <View
            style={[
              styles.itemIcone,
              { backgroundColor: cores.cartao },
            ]}
          >
            <FontAwesome
              name="calendar-check-o"
              size={21}
              color={cores.primario}
            />
          </View>

          <View style={styles.itemTexto}>
            <Text style={[styles.itemTitulo, { color: cores.texto }]}>
              MyLembrete
            </Text>

            <Text
              style={[
                styles.itemDescricao,
                { color: cores.textoSecundario },
              ]}
            >
              Organize sua rotina com facilidade.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.divisor,
            { backgroundColor: cores.borda },
          ]}
        />

        <View style={styles.versao}>
          <Text style={{ color: cores.textoSecundario }}>
            Versão
          </Text>

          <Text style={[styles.versaoTexto, { color: cores.texto }]}>
            1.0.0
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.rodape,
          { color: cores.textoSecundario },
        ]}
      >
        MyLembrete © 2026
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },

  conteudo: {
    padding: 22,
    paddingTop: 45,
    paddingBottom: 35,
  },

  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 35,
  },

  botaoVoltar: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  tituloContainer: {
    flex: 1,
  },

  titulo: {
    fontSize: 25,
    fontWeight: 'bold',
  },

  subtitulo: {
    fontSize: 13,
    marginTop: 4,
  },

  secaoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 10,
  },

  cartao: {
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 25,
  },

  cartaoCores: {
    paddingVertical: 19,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 17,
  },

  itemIcone: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  itemTexto: {
    flex: 1,
  },

  itemTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  itemDescricao: {
    fontSize: 12,
    marginTop: 5,
  },

  descricaoCores: {
    marginBottom: 20,
  },

  gradeCores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  opcaoCor: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 22,
  },

  circuloCor: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },

  corSelecionada: {
    transform: [{ scale: 1.12 }],
  },

  nomeCor: {
    fontSize: 12,
    marginTop: 9,
  },

  previa: {
    borderWidth: 1,
    borderRadius: 13,
    padding: 14,
    marginTop: 3,
  },

  previaTitulo: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },

  botaoPrevia: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },

  textoBotaoPrevia: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  divisor: {
    height: 1,
  },

  versao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 17,
  },

  versaoTexto: {
    fontWeight: 'bold',
  },

  rodape: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 10,
  },
});
