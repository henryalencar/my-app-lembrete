
import React, { useCallback } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

import { useLembrete } from '../../hooks/useLembrete';
import { useTema } from '../../contexts/themeContexts';
import { Prioridade } from '../../types/lembrete';

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

export default function Home() {
  const router = useRouter();

  const { tema, cores, alternarTema } = useTema();
  const modoEscuro = tema === 'escuro';

  const {
    lembretes,
    carregando,
    carregarLembretes,
  } = useLembrete();

  useFocusEffect(
    useCallback(() => {
      carregarLembretes();
    }, [carregarLembretes])
  );

  const hoje = (() => {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  })();

  const pendentes = lembretes.filter(
    (item) => !item.concluido
  );

  const concluidos = lembretes.filter(
    (item) => item.concluido
  );

  const lembretesHoje = pendentes.filter(
    (item) => item.data === hoje
  );

  const programados = pendentes.filter(
    (item) => item.data > hoje
  );

  const diarios = lembretes.filter(
    (item) => item.diario && !item.concluido
  );

  const proximosLembretes = [...pendentes]
    .sort((a, b) => {
      const dataA = `${a.data} ${a.horario}`;
      const dataB = `${b.data} ${b.horario}`;

      return dataA.localeCompare(dataB);
    })
    .slice(0, 5);

  function formatarData(data: string) {
    const partes = data.split('-');

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function abrirLembrete(id: string) {
    router.push(`/lembrete/${id}`);
  }

  return (
    <ScrollView
      style={[
        styles.tela,
        { backgroundColor: cores.fundo },
      ]}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >

      {/* CABEÇALHO */}

      <View style={styles.cabecalho}>
        <View>
          <Text
            style={[
              styles.pequenoTexto,
              { color: cores.textoSecundario },
            ]}
          >
            SEU ORGANIZADOR PESSOAL
          </Text>

          <Text
            style={[
              styles.titulo,
              { color: cores.texto },
            ]}
          >
            Bem-vindo(a)!
          </Text>

          <Text
            style={[
              styles.subtitulo,
              { color: cores.textoSecundario },
            ]}
          >
            Vamos organizar seu dia?
          </Text>
        </View>

        <View style={styles.acoesCabecalho}>

          {/* ALTERNAR TEMA */}

          <TouchableOpacity
            style={[
              styles.botaoTema,
              { backgroundColor: cores.superficie },
            ]}
            onPress={alternarTema}
            activeOpacity={0.7}
          >
            <FontAwesome
              name={modoEscuro ? 'sun-o' : 'moon-o'}
              size={21}
              color={cores.texto}
            />
          </TouchableOpacity>

          {/* CONFIGURAÇÕES */}

          <TouchableOpacity
            style={[
              styles.botaoTema,
              { backgroundColor: cores.superficie },
            ]}
            onPress={() => router.push('/configuracoes')}
            activeOpacity={0.7}
          >
            <FontAwesome
              name="cog"
              size={23}
              color={cores.texto}
            />
          </TouchableOpacity>

          {/* PERFIL */}

          <View
            style={[
              styles.iconePerfil,
              { backgroundColor: cores.cartao },
            ]}
          >
            <FontAwesome
              name="user"
              size={24}
              color={cores.primario}
            />
          </View>
        </View>
      </View>

      {/* RESUMO */}

      <View
        style={[
          styles.resumo,
          { backgroundColor: cores.primario },
        ]}
      >
        <View style={styles.resumoTopo}>
          <Text style={styles.resumoTitulo}>
            Seus lembretes
          </Text>

          <FontAwesome
            name="calendar-check-o"
            size={21}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.resumoNumeros}>
          <View>
            <Text style={styles.numero}>
              {pendentes.length}
            </Text>

            <Text style={styles.resumoLegenda}>
              Pendentes
            </Text>
          </View>

          <View style={styles.separador} />

          <View>
            <Text style={styles.numero}>
              {concluidos.length}
            </Text>

            <Text style={styles.resumoLegenda}>
              Concluídos
            </Text>
          </View>

          <View style={styles.separador} />

          <View>
            <Text style={styles.numero}>
              {lembretesHoje.length}
            </Text>

            <Text style={styles.resumoLegenda}>
              Para hoje
            </Text>
          </View>
        </View>
      </View>

      {/* CATEGORIAS */}

      <View style={styles.secao}>
        <Text
          style={[
            styles.secaoTitulo,
            { color: cores.texto },
          ]}
        >
          Categorias
        </Text>

        <View style={styles.categorias}>

          {/* HOJE */}

          <TouchableOpacity
            style={[
              styles.categoria,
              {
                backgroundColor: cores.superficie,
                borderColor: cores.borda,
              },
            ]}
            onPress={() =>
              router.push('/(tabs)/todos?filtro=hoje')
            }
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.iconeCategoria,
                { backgroundColor: cores.cartao },
              ]}
            >
              <FontAwesome
                name="sun-o"
                size={23}
                color={cores.primario}
              />
            </View>

            <Text
              style={[
                styles.categoriaTitulo,
                { color: cores.texto },
              ]}
            >
              Hoje
            </Text>

            <Text
              style={[
                styles.categoriaDescricao,
                { color: cores.textoSecundario },
              ]}
            >
              {lembretesHoje.length} lembretes
            </Text>
          </TouchableOpacity>

          {/* PROGRAMADOS */}

          <TouchableOpacity
            style={[
              styles.categoria,
              {
                backgroundColor: cores.superficie,
                borderColor: cores.borda,
              },
            ]}
            onPress={() =>
              router.push('/(tabs)/todos?filtro=programados')
            }
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.iconeCategoria,
                { backgroundColor: cores.cartao },
              ]}
            >
              <FontAwesome
                name="calendar"
                size={23}
                color={cores.primario}
              />
            </View>

            <Text
              style={[
                styles.categoriaTitulo,
                { color: cores.texto },
              ]}
            >
              Programados
            </Text>

            <Text
              style={[
                styles.categoriaDescricao,
                { color: cores.textoSecundario },
              ]}
            >
              {programados.length} lembretes
            </Text>
          </TouchableOpacity>

          {/* TODOS */}

          <TouchableOpacity
            style={[
              styles.categoria,
              {
                backgroundColor: cores.superficie,
                borderColor: cores.borda,
              },
            ]}
            onPress={() =>
              router.push('/(tabs)/todos?filtro=todos')
            }
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.iconeCategoria,
                { backgroundColor: cores.cartao },
              ]}
            >
              <FontAwesome
                name="list-ul"
                size={23}
                color={cores.primario}
              />
            </View>

            <Text
              style={[
                styles.categoriaTitulo,
                { color: cores.texto },
              ]}
            >
              Todos
            </Text>

            <Text
              style={[
                styles.categoriaDescricao,
                { color: cores.textoSecundario },
              ]}
            >
              {lembretes.length} lembretes
            </Text>
          </TouchableOpacity>

          {/* DIÁRIOS */}

          <TouchableOpacity
            style={[
              styles.categoria,
              {
                backgroundColor: cores.superficie,
                borderColor: cores.borda,
              },
            ]}
            onPress={() =>
              router.push('/(tabs)/todos?filtro=diarios')
            }
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.iconeCategoria,
                { backgroundColor: cores.cartao },
              ]}
            >
              <FontAwesome
                name="refresh"
                size={23}
                color={cores.primario}
              />
            </View>

            <Text
              style={[
                styles.categoriaTitulo,
                { color: cores.texto },
              ]}
            >
              Diários
            </Text>

            <Text
              style={[
                styles.categoriaDescricao,
                { color: cores.textoSecundario },
              ]}
            >
              {diarios.length} lembretes
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PRÓXIMOS LEMBRETES */}

      <View style={styles.secao}>
        <View style={styles.linhaTitulo}>
          <Text
            style={[
              styles.secaoTitulo,
              { color: cores.texto },
            ]}
          >
            Próximos lembretes
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push('/(tabs)/todos?filtro=todos')
            }
          >
            <Text
              style={[
                styles.verTodos,
                { color: cores.primario },
              ]}
            >
              Ver todos
            </Text>
          </TouchableOpacity>
        </View>

        {carregando ? (
          <ActivityIndicator
            size="large"
            color={cores.primario}
            style={styles.carregando}
          />
        ) : proximosLembretes.length === 0 ? (
          <View
            style={[
              styles.vazio,
              { backgroundColor: cores.superficie },
            ]}
          >
            <FontAwesome
              name="calendar-o"
              size={35}
              color={cores.textoSecundario}
            />

            <Text
              style={[
                styles.vazioTitulo,
                { color: cores.texto },
              ]}
            >
              Nenhum lembrete por enquanto
            </Text>

            <Text
              style={[
                styles.vazioDescricao,
                { color: cores.textoSecundario },
              ]}
            >
              Crie seu primeiro lembrete e organize sua rotina!
            </Text>
          </View>
        ) : (
          proximosLembretes.map((item) => {
            const prioridade = configuracaoPrioridade[
              item.prioridade ?? 'media'
            ];

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.cartao,
                  {
                    backgroundColor: cores.cartao,
                    borderColor: cores.borda,
                  },
                ]}
                onPress={() => abrirLembrete(item.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.cartaoIcone,
                    { backgroundColor: cores.superficie },
                  ]}
                >
                  <FontAwesome
                    name="bell-o"
                    size={19}
                    color={cores.primario}
                  />
                </View>

                <View style={styles.cartaoConteudo}>
                  <Text
                    style={[
                      styles.cartaoTitulo,
                      { color: cores.texto },
                    ]}
                    numberOfLines={1}
                  >
                    {item.titulo}
                  </Text>

                  <Text
                    style={[
                      styles.cartaoDescricao,
                      { color: cores.textoSecundario },
                    ]}
                  >
                    {formatarData(item.data)} às {item.horario}
                  </Text>

                  <View style={styles.etiquetas}>
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

                    {item.diario && (
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
                  size={23}
                  color={cores.textoSecundario}
                />
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* BOTÃO NOVO LEMBRETE */}

      <TouchableOpacity
        style={[
          styles.botaoNovo,
          { backgroundColor: cores.primario },
        ]}
        onPress={() => router.push('/lembrete/novo')}
        activeOpacity={0.85}
      >
        <FontAwesome
          name="plus"
          size={17}
          color="#FFFFFF"
        />

        <Text style={styles.botaoNovoTexto}>
          Criar novo lembrete
        </Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />

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
  },

  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  pequenoTexto: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 5,
  },

  subtitulo: {
    fontSize: 14,
    marginTop: 4,
  },

  acoesCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  botaoTema: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconePerfil: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resumo: {
    borderRadius: 20,
    padding: 20,
  },

  resumoTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  resumoTitulo: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  resumoNumeros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
  },

  numero: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  resumoLegenda: {
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 3,
    opacity: 0.85,
  },

  separador: {
    width: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    opacity: 0.35,
  },

  secao: {
    marginTop: 30,
  },

  secaoTitulo: {
    fontSize: 19,
    fontWeight: 'bold',
  },

  categorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  categoria: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },

  iconeCategoria: {
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  categoriaTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  categoriaDescricao: {
    fontSize: 11,
    marginTop: 5,
  },

  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  verTodos: {
    fontSize: 13,
    fontWeight: '600',
  },

  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 11,
    borderWidth: 1,
  },

  cartaoIcone: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  cartaoConteudo: {
    flex: 1,
  },

  cartaoTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  cartaoDescricao: {
    fontSize: 12,
    marginTop: 5,
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

  vazio: {
    borderRadius: 16,
    alignItems: 'center',
    padding: 25,
  },

  vazioTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 12,
  },

  vazioDescricao: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },

  carregando: {
    marginVertical: 30,
  },

  botaoNovo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    marginTop: 28,
    gap: 10,
  },

  botaoNovoTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
