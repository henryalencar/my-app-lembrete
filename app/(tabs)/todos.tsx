
import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Animated,
} from 'react-native';

import { FontAwesome } from '@expo/vector-icons';
import {
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
} from 'expo-router';

import { useLembrete } from '../../hooks/useLembrete';
import { useTema } from '../../contexts/themeContexts';
import CartaoLembrete from '../../components/cartaoLembrete/cartaoLembrete';
import { Lembrete, Prioridade } from '../../types/lembrete';

type Filtro =
  | 'todos'
  | 'hoje'
  | 'programados'
  | 'concluidos'
  | 'diarios';

type FiltroPrioridade = 'todas' | Prioridade;

type LinhaLista =
  | {
      tipo: 'cabecalho';
      id: string;
      titulo: string;
      quantidade: number;
    }
  | {
      tipo: 'lembrete';
      id: string;
      lembrete: Lembrete;
    };

const opcoesPrioridade: {
  id: FiltroPrioridade;
  nome: string;
  cor: string;
  fundo: string;
}[] = [
  {
    id: 'todas',
    nome: 'Todas',
    cor: '#64748B',
    fundo: '#E2E8F0',
  },
  {
    id: 'baixa',
    nome: 'Baixa',
    cor: '#16A34A',
    fundo: '#DCFCE7',
  },
  {
    id: 'media',
    nome: 'Média',
    cor: '#CA8A04',
    fundo: '#FEF9C3',
  },
  {
    id: 'alta',
    nome: 'Alta',
    cor: '#EF4444',
    fundo: '#FEE2E2',
  },
];

// ANIMAÇÃO DOS LEMBRETES

type PropsLinha = {
  lembrete: Lembrete;
  index: number;
  onPress: () => void;
  onConcluir: () => void;
  onExcluir: (id: string) => Promise<void>;
};

function LinhaLembreteAnimada({
  lembrete,
  index,
  onPress,
  onConcluir,
  onExcluir,
}: PropsLinha) {
  const entradaOpacidade = useRef(new Animated.Value(0)).current;
  const entradaY = useRef(new Animated.Value(18)).current;

  const deslocamento = useRef(new Animated.Value(0)).current;
  const opacidade = useRef(new Animated.Value(1)).current;
  const animando = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entradaOpacidade, {
        toValue: 1,
        duration: 350,
        delay: Math.min(index * 55, 330),
        useNativeDriver: true,
      }),
      Animated.timing(entradaY, {
        toValue: 0,
        duration: 350,
        delay: Math.min(index * 55, 330),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, entradaOpacidade, entradaY]);

  function executarAnimacao() {
    if (animando.current) return;

    animando.current = true;

    Animated.parallel([
      Animated.timing(deslocamento, {
        toValue: 450,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacidade, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(async ({ finished }) => {
      if (!finished) {
        animando.current = false;
        return;
      }

      try {
        await onExcluir(lembrete.id);
      } catch (erro) {
        deslocamento.setValue(0);
        opacidade.setValue(1);
        animando.current = false;

        Alert.alert(
          'Erro',
          'Não foi possível excluir o lembrete. Tente novamente.'
        );
      }
    });
  }

  function confirmarExclusao() {
    Alert.alert(
      'Excluir lembrete',
      'Tem certeza de que deseja excluir este lembrete?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: executarAnimacao,
        },
      ]
    );
  }

  return (
    <Animated.View
      style={[
        styles.itemContainer,
        {
          opacity: entradaOpacidade,
          transform: [{ translateY: entradaY }],
        },
      ]}
    >
      <Animated.View
        style={{
          opacity: opacidade,
          transform: [{ translateX: deslocamento }],
        }}
      >
        <CartaoLembrete
          lembrete={lembrete}
          onPress={onPress}
          onConcluir={onConcluir}
        />

        <TouchableOpacity
          onPress={confirmarExclusao}
          style={styles.excluir}
          activeOpacity={0.7}
        >
          <FontAwesome
            name="trash-o"
            size={18}
            color="#EF4444"
          />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// TELA PRINCIPAL

export default function Todos() {
  const router = useRouter();

  const params = useLocalSearchParams<{ filtro?: string }>();

  const { cores } = useTema();

  const {
    lembretes,
    carregando,
    concluir,
    remover,
    carregarLembretes,
  } = useLembrete();

  const [filtro, setFiltro] = useState<Filtro>('todos');

  const [filtroPrioridade, setFiltroPrioridade] =
    useState<FiltroPrioridade>('todas');

  const [pesquisa, setPesquisa] = useState('');

  // ATUALIZAR AO ABRIR A TELA

  useFocusEffect(
    useCallback(() => {
      carregarLembretes();
    }, [carregarLembretes])
  );

  // RECEBER FILTRO DA NAVEGAÇÃO

  useEffect(() => {
    const filtrosValidos: Filtro[] = [
      'todos',
      'hoje',
      'programados',
      'concluidos',
      'diarios',
    ];

    if (
      params.filtro &&
      filtrosValidos.includes(params.filtro as Filtro)
    ) {
      setFiltro(params.filtro as Filtro);
    }
  }, [params.filtro]);

  // DATA ATUAL

  const hoje = new Date();

  const dataHoje = [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, '0'),
    String(hoje.getDate()).padStart(2, '0'),
  ].join('-');

  const amanha = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate() + 1
  );

  const dataAmanha = [
    amanha.getFullYear(),
    String(amanha.getMonth() + 1).padStart(2, '0'),
    String(amanha.getDate()).padStart(2, '0'),
  ].join('-');

  // FILTROS E PESQUISA

  const listaFiltrada = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();

    return lembretes
      .filter((item) => {
        if (filtro === 'hoje') {
          return item.data === dataHoje && !item.concluido;
        }

        if (filtro === 'programados') {
          return item.data > dataHoje && !item.concluido;
        }

        if (filtro === 'concluidos') {
          return item.concluido;
        }

        if (filtro === 'diarios') {
          return item.diario && !item.concluido;
        }

        return true;
      })
      .filter((item) => {
        if (filtroPrioridade === 'todas') {
          return true;
        }

        return (
          (item.prioridade ?? 'media') === filtroPrioridade
        );
      })
      .filter((item) => {
        if (!termo) return true;

        return (
          item.titulo.toLowerCase().includes(termo) ||
          (item.nota || '').toLowerCase().includes(termo)
        );
      })
      .sort((a, b) => {
        return `${a.data} ${a.horario}`.localeCompare(
          `${b.data} ${b.horario}`
        );
      });
  }, [
    lembretes,
    filtro,
    filtroPrioridade,
    pesquisa,
    dataHoje,
  ]);

  // ORGANIZAR POR PERÍODO

  const listaOrganizada = useMemo(() => {
    const grupos: Record<string, Lembrete[]> = {
      anteriores: [],
      hoje: [],
      amanha: [],
      proximos: [],
    };

    listaFiltrada.forEach((item) => {
      if (item.data < dataHoje) {
        grupos.anteriores.push(item);
      } else if (item.data === dataHoje) {
        grupos.hoje.push(item);
      } else if (item.data === dataAmanha) {
        grupos.amanha.push(item);
      } else {
        grupos.proximos.push(item);
      }
    });

    const linhas: LinhaLista[] = [];

    const adicionarGrupo = (
      chave: string,
      titulo: string
    ) => {
      const itens = grupos[chave];

      if (itens.length === 0) return;

      linhas.push({
        tipo: 'cabecalho',
        id: `cabecalho-${chave}`,
        titulo,
        quantidade: itens.length,
      });

      itens.forEach((item) => {
        linhas.push({
          tipo: 'lembrete',
          id: item.id,
          lembrete: item,
        });
      });
    };

    adicionarGrupo('anteriores', 'Anteriores');
    adicionarGrupo('hoje', 'Hoje');
    adicionarGrupo('amanha', 'Amanhã');
    adicionarGrupo('proximos', 'Próximos dias');

    return linhas;
  }, [listaFiltrada, dataHoje, dataAmanha]);

  // FILTROS DISPONÍVEIS

  const nomesFiltros: [Filtro, string][] = [
    ['todos', 'Todos'],
    ['hoje', 'Hoje'],
    ['programados', 'Programados'],
    ['concluidos', 'Concluídos'],
    ['diarios', 'Diários'],
  ];

  return (
    <View
      style={[
        styles.tela,
        { backgroundColor: cores.fundo },
      ]}
    >
      {/* CABEÇALHO */}

      <View style={styles.cabecalho}>
        <View style={styles.titulos}>
          <Text
            style={[
              styles.pequenoTexto,
              { color: cores.textoSecundario },
            ]}
          >
            ORGANIZAÇÃO
          </Text>

          <Text
            style={[
              styles.titulo,
              { color: cores.texto },
            ]}
          >
            Minha Lista
          </Text>

          <Text
            style={[
              styles.subtitulo,
              { color: cores.textoSecundario },
            ]}
          >
            Todos os seus compromissos em um só lugar.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.botaoCriar,
            {
              borderColor: cores.primario,
              backgroundColor: cores.superficie,
            },
          ]}
          onPress={() => router.push('/lembrete/novo')}
          activeOpacity={0.8}
        >
          <FontAwesome
            name="plus"
            size={13}
            color={cores.primario}
          />

          <Text
            style={[
              styles.textoCriar,
              { color: cores.primario },
            ]}
          >
            CRIAR
          </Text>
        </TouchableOpacity>
      </View>

      {/* PESQUISA */}

      <View
        style={[
          styles.containerPesquisa,
          {
            backgroundColor: cores.superficie,
            borderColor: cores.borda,
          },
        ]}
      >
        <FontAwesome
          name="search"
          size={16}
          color={cores.textoSecundario}
        />

        <TextInput
          style={[
            styles.inputPesquisa,
            { color: cores.texto },
          ]}
          placeholder="Pesquisar lembrete..."
          placeholderTextColor={cores.textoSecundario}
          value={pesquisa}
          onChangeText={setPesquisa}
          returnKeyType="search"
        />

        {pesquisa.length > 0 && (
          <TouchableOpacity onPress={() => setPesquisa('')}>
            <FontAwesome
              name="times-circle"
              size={17}
              color={cores.textoSecundario}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTROS DE CATEGORIA */}

      <View style={styles.filtros}>
        {nomesFiltros.map(([valor, nome]) => {
          const ativo = filtro === valor;

          return (
            <TouchableOpacity
              key={valor}
              style={[
                styles.filtro,
                {
                  backgroundColor: ativo
                    ? cores.primario
                    : cores.superficie,
                  borderColor: ativo
                    ? cores.primario
                    : cores.borda,
                },
              ]}
              onPress={() => setFiltro(valor)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.textoFiltro,
                  {
                    color: ativo
                      ? '#FFFFFF'
                      : cores.textoSecundario,
                  },
                ]}
              >
                {nome}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* FILTRO DE PRIORIDADE */}

      <View style={styles.secaoPrioridade}>
        <View style={styles.tituloPrioridadeContainer}>
          <FontAwesome
            name="sliders"
            size={13}
            color={cores.textoSecundario}
          />

          <Text
            style={[
              styles.tituloPrioridade,
              { color: cores.textoSecundario },
            ]}
          >
            PRIORIDADE
          </Text>
        </View>

        <View style={styles.filtrosPrioridade}>
          {opcoesPrioridade.map((opcao) => {
            const ativo = filtroPrioridade === opcao.id;

            return (
              <TouchableOpacity
                key={opcao.id}
                style={[
                  styles.filtroPrioridade,
                  {
                    backgroundColor: ativo
                      ? opcao.fundo
                      : cores.superficie,
                    borderColor: ativo
                      ? opcao.cor
                      : cores.borda,
                  },
                ]}
                onPress={() => setFiltroPrioridade(opcao.id)}
                activeOpacity={0.8}
              >
                {opcao.id !== 'todas' && (
                  <View
                    style={[
                      styles.indicadorPrioridade,
                      { backgroundColor: opcao.cor },
                    ]}
                  />
                )}

                <Text
                  style={[
                    styles.textoFiltroPrioridade,
                    {
                      color: ativo
                        ? opcao.cor
                        : cores.textoSecundario,
                    },
                  ]}
                >
                  {opcao.nome}
                </Text>

                {ativo && (
                  <FontAwesome
                    name="check"
                    size={11}
                    color={opcao.cor}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* CONTAGEM */}

      <View style={styles.contagem}>
        <Text
          style={[
            styles.contagemTexto,
            { color: cores.textoSecundario },
          ]}
        >
          {listaFiltrada.length}{' '}
          {listaFiltrada.length === 1
            ? 'lembrete encontrado'
            : 'lembretes encontrados'}
        </Text>
      </View>

      {/* LISTA */}

      <FlatList
        data={listaOrganizada}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshing={carregando}
        onRefresh={carregarLembretes}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => {
          if (item.tipo === 'cabecalho') {
            return (
              <View style={styles.cabecalhoGrupo}>
                <Text
                  style={[
                    styles.tituloGrupo,
                    { color: cores.texto },
                  ]}
                >
                  {item.titulo}
                </Text>

                <View
                  style={[
                    styles.contadorGrupo,
                    { backgroundColor: cores.cartao },
                  ]}
                >
                  <Text
                    style={[
                      styles.textoContadorGrupo,
                      { color: cores.primario },
                    ]}
                  >
                    {item.quantidade}
                  </Text>
                </View>
              </View>
            );
          }

          const lembrete = item.lembrete;

          return (
            <LinhaLembreteAnimada
              lembrete={lembrete}
              index={index}
              onPress={() =>
                router.push(`/lembrete/${lembrete.id}`)
              }
              onConcluir={() => concluir(lembrete.id)}
              onExcluir={remover}
            />
          );
        }}
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
              name="clipboard"
              size={42}
              color={cores.primario}
            />

            <Text
              style={[
                styles.vazioTitulo,
                { color: cores.texto },
              ]}
            >
              Nenhum lembrete encontrado
            </Text>

            <Text
              style={[
                styles.vazioDescricao,
                { color: cores.textoSecundario },
              ]}
            >
              {pesquisa
                ? 'Tente pesquisar por outro termo.'
                : filtroPrioridade !== 'todas'
                  ? 'Não existem lembretes com essa prioridade nesta categoria.'
                  : 'Seus lembretes aparecerão aqui.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ESTILOS

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    paddingTop: 45,
  },

  cabecalho: {
    paddingHorizontal: 22,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  titulos: {
    flex: 1,
  },

  pequenoTexto: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  titulo: {
    fontSize: 27,
    fontWeight: 'bold',
    marginTop: 5,
  },

  subtitulo: {
    fontSize: 12,
    marginTop: 5,
    maxWidth: 220,
  },

  botaoCriar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 8,
  },

  textoCriar: {
    fontWeight: 'bold',
    fontSize: 12,
  },

  containerPesquisa: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    paddingHorizontal: 15,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },

  inputPesquisa: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },

  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 18,
    gap: 8,
    marginTop: 16,
  },

  filtro: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 20,
    borderWidth: 1,
  },

  textoFiltro: {
    fontSize: 12,
    fontWeight: '600',
  },

  secaoPrioridade: {
    marginTop: 17,
    paddingHorizontal: 20,
  },

  tituloPrioridadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },

  tituloPrioridade: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  filtrosPrioridade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  filtroPrioridade: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },

  indicadorPrioridade: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  textoFiltroPrioridade: {
    fontSize: 11,
    fontWeight: '600',
  },

  contagem: {
    paddingHorizontal: 22,
    marginTop: 18,
    marginBottom: 5,
  },

  contagemTexto: {
    fontSize: 12,
  },

  lista: {
    paddingHorizontal: 18,
    paddingBottom: 25,
    flexGrow: 1,
  },

  cabecalhoGrupo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 24,
    marginBottom: 12,
  },

  tituloGrupo: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  contadorGrupo: {
    minWidth: 23,
    height: 23,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  textoContadorGrupo: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  itemContainer: {
    position: 'relative',
    marginBottom: 14,
  },

  excluir: {
    position: 'absolute',
    right: 38,
    top: '50%',
    marginTop: -17,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
  },

  vazio: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 35,
    marginTop: 35,
    borderRadius: 16,
    borderWidth: 1,
  },

  vazioTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },

  vazioDescricao: {
    fontSize: 12,
    marginTop: 7,
    textAlign: 'center',
  },
});
