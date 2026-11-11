import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import DateTimePicker, {
  DateTimePickerEvent,
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';

import CampoTexto from '../../components/campoTexto/campoTexto';
import Botao from '../../components/botao/botao';

import { useLembrete } from '../../hooks/useLembrete';
import { useTema } from '../../contexts/themeContexts';
import { Lembrete, Prioridade } from '../../types/lembrete';

// CONVERTER DATA DO BANCO
function converterData(data: string): Date {
  const [ano, mes, dia] = data.split('-').map(Number);
  const resultado = new Date(ano, mes - 1, dia);

  return Number.isNaN(resultado.getTime()) ? new Date() : resultado;
}

// CONVERTER HORÁRIO DO BANCO
function converterHorario(horario: string): Date {
  const [hora, minuto] = horario.split(':').map(Number);
  const resultado = new Date();

  resultado.setHours(
    Number.isNaN(hora) ? 0 : hora,
    Number.isNaN(minuto) ? 0 : minuto,
    0,
    0
  );

  return resultado;
}

// FORMATAR DATA
function formatarData(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

// FORMATAR HORÁRIO
function formatarHorario(data: Date): string {
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');

  return `${hora}:${minuto}`;
}

// DATA LEGÍVEL
function dataLegivel(data: Date): string {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// OPÇÕES DE PRIORIDADE
const opcoesPrioridade = [
  {
    id: 'baixa',
    nome: 'Baixa',
    cor: '#16A34A',
    fundo: '#DCFCE7',
    icone: 'arrow-down',
  },
  {
    id: 'media',
    nome: 'Média',
    cor: '#CA8A04',
    fundo: '#FEF9C3',
    icone: 'minus',
  },
  {
    id: 'alta',
    nome: 'Alta',
    cor: '#EF4444',
    fundo: '#FEE2E2',
    icone: 'arrow-up',
  },
] as const;

export default function EditarLembrete() {
  const router = useRouter();

  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { cores, tema } = useTema();
  const modoEscuro = tema === 'escuro';

  const {
    lembretes,
    carregando,
    editar,
    remover,
  } = useLembrete();

  // DADOS DO LEMBRETE
  const [titulo, setTitulo] = useState('');
  const [nota, setNota] = useState('');

  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [horarioSelecionado, setHorarioSelecionado] = useState(new Date());

  const [diario, setDiario] = useState(false);
  const [prioridade, setPrioridade] = useState<Prioridade>('media');

  // CONTROLE DOS SELETORES
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarRelogio, setMostrarRelogio] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [inicializado, setInicializado] = useState(false);

  // BUSCAR LEMBRETE
  const lembrete = lembretes.find(
    (item) => String(item.id) === String(id)
  );

  // CARREGAR DADOS
  useEffect(() => {
    if (!lembrete || inicializado) return;

    setTitulo(lembrete.titulo);
    setNota(lembrete.nota);
    setDataSelecionada(converterData(lembrete.data));
    setHorarioSelecionado(converterHorario(lembrete.horario));
    setDiario(lembrete.diario);
    setPrioridade(lembrete.prioridade ?? 'media');

    setInicializado(true);
  }, [lembrete, inicializado]);

  // ALTERAR DATA
  function alterarData(evento: DateTimePickerEvent, novaData?: Date) {
    if (evento.type === 'set' && novaData) {
      setDataSelecionada(novaData);
    }
  }

  // ALTERAR HORÁRIO
  function alterarHorario(evento: DateTimePickerEvent, novoHorario?: Date) {
    if (evento.type === 'set' && novoHorario) {
      setHorarioSelecionado(novoHorario);
    }
  }

  // ABRIR CALENDÁRIO
  function abrirCalendario() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dataSelecionada,
        mode: 'date',
        display: 'calendar',
        minimumDate: new Date(new Date().setHours(0, 0, 0, 0)),
        onChange: alterarData,
      });

      return;
    }

    setMostrarCalendario(true);
  }

  // ABRIR RELÓGIO
  function abrirRelogio() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: horarioSelecionado,
        mode: 'time',
        display: 'clock',
        is24Hour: true,
        onChange: alterarHorario,
      });

      return;
    }

    setMostrarRelogio(true);
  }

  // SALVAR ALTERAÇÕES
  async function salvar() {
    if (!lembrete || salvando) return;

    if (!titulo.trim()) {
      Alert.alert('Atenção', 'Digite o título do lembrete.');
      return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataSelecionada < hoje) {
      Alert.alert('Atenção', 'Escolha uma data de hoje em diante.');
      return;
    }

    const agora = new Date();
    const dataHora = new Date(dataSelecionada);

    dataHora.setHours(
      horarioSelecionado.getHours(),
      horarioSelecionado.getMinutes(),
      0,
      0
    );

    if (
      formatarData(dataSelecionada) === formatarData(agora) &&
      dataHora <= agora
    ) {
      Alert.alert('Atenção', 'Escolha um horário futuro.');
      return;
    }

    const atualizado: Lembrete = {
      ...lembrete,
      titulo: titulo.trim(),
      nota: nota.trim(),
      data: formatarData(dataSelecionada),
      horario: formatarHorario(horarioSelecionado),
      diario,
      prioridade,
    };

    try {
      setSalvando(true);

      await editar(atualizado);

      Alert.alert(
        'Sucesso!',
        'Lembrete atualizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (erro) {
      console.error('Erro ao editar lembrete:', erro);

      Alert.alert(
        'Erro',
        'Não foi possível atualizar o lembrete. Tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }

  // EXCLUIR LEMBRETE
  function confirmarExclusao() {
    if (!lembrete) return;

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
          onPress: async () => {
            try {
              await remover(lembrete.id);
              router.back();
            } catch (erro) {
              console.error('Erro ao excluir:', erro);

              Alert.alert(
                'Erro',
                'Não foi possível excluir o lembrete.'
              );
            }
          },
        },
      ]
    );
  }

  // ESTILOS
  const estilos = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: cores.fundo,
    },

    conteudo: {
      padding: 22,
      paddingTop: 55,
      paddingBottom: 40,
    },

    centralizado: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: cores.fundo,
      padding: 25,
      gap: 20,
    },

    erro: {
      fontSize: 17,
      color: cores.texto,
      marginBottom: 10,
    },

    cabecalho: {
      minHeight: 45,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 28,
    },

    iconeCabecalho: {
      position: 'absolute',
      left: 0,
      padding: 8,
    },

    tituloTela: {
      fontSize: 19,
      fontWeight: '800',
      color: cores.texto,
      letterSpacing: 1,
    },

    iconeExcluir: {
      position: 'absolute',
      right: 0,
      width: 38,
      height: 38,
      borderRadius: 20,
      backgroundColor: '#EF4444',
      justifyContent: 'center',
      alignItems: 'center',
    },

    painel: {
      backgroundColor: cores.superficie,
      borderRadius: 17,
      padding: 17,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: cores.borda,
    },

    labelPainel: {
      fontSize: 15,
      fontWeight: '700',
      color: cores.texto,
      marginBottom: 12,
    },

    seletor: {
      backgroundColor: cores.campo,
      borderRadius: 12,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      borderWidth: 1,
      borderColor: cores.borda,
    },

    textosSeletor: {
      flex: 1,
      marginLeft: 14,
    },

    labelSeletor: {
      fontSize: 12,
      color: cores.textoSecundario,
      marginBottom: 4,
    },

    valorSeletor: {
      fontSize: 16,
      fontWeight: '600',
      color: cores.texto,
    },

    painelPrioridade: {
      backgroundColor: cores.superficie,
      borderRadius: 17,
      padding: 17,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: cores.borda,
    },

    descricaoPrioridade: {
      fontSize: 12,
      color: cores.textoSecundario,
      marginTop: -5,
      marginBottom: 15,
    },

    opcoesPrioridade: {
      flexDirection: 'row',
      gap: 9,
    },

    opcaoPrioridade: {
      flex: 1,
      paddingVertical: 13,
      paddingHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1.5,
    },

    textoPrioridade: {
      fontSize: 12,
      fontWeight: '700',
      marginTop: 7,
    },

    opcaoDiaria: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: cores.superficie,
      borderRadius: 15,
      marginBottom: 25,
      borderWidth: 1,
      borderColor: cores.borda,
    },

    textoDiario: {
      flex: 1,
      paddingRight: 10,
    },

    tituloDiario: {
      fontSize: 15,
      fontWeight: '700',
      color: cores.texto,
    },

    descricaoDiario: {
      fontSize: 12,
      color: cores.textoSecundario,
      marginTop: 5,
    },

    botoes: {
      flexDirection: 'row',
      gap: 12,
    },

    botaoMetade: {
      flex: 1,
    },

    botaoExcluir: {
      marginTop: 22,
      height: 48,
      backgroundColor: '#EF4444',
      borderRadius: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },

    textoExcluir: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 14,
    },

    // MODAIS DOS SELETORES
    modalFundo: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },

    modalConteudo: {
      width: '100%',
      backgroundColor: cores.superficie,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
    },

    modalTitulo: {
      fontSize: 18,
      fontWeight: '800',
      color: cores.texto,
      marginBottom: 15,
    },

    seletorIOS: {
      width: '100%',
      alignItems: 'center',
    },

    botoesModal: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
      marginTop: 18,
    },

    botaoModal: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },

    textoBotaoModal: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });

  // CARREGAMENTO
  if (carregando) {
    return (
      <View style={estilos.centralizado}>
        <ActivityIndicator size="large" color={cores.primario} />
      </View>
    );
  }

  // LEMBRETE NÃO ENCONTRADO
  if (!lembrete) {
    return (
      <View style={estilos.centralizado}>
        <Text style={estilos.erro}>
          Lembrete não encontrado.
        </Text>

        <Botao
          titulo="VOLTAR"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  // AGUARDANDO DADOS
  if (!inicializado) {
    return (
      <View style={estilos.centralizado}>
        <ActivityIndicator size="large" color={cores.primario} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={estilos.container}
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        {/* CABEÇALHO */}
        <View style={estilos.cabecalho}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={estilos.iconeCabecalho}
          >
            <FontAwesome
              name="arrow-left"
              size={21}
              color={cores.texto}
            />
          </TouchableOpacity>

          <Text style={estilos.tituloTela}>
            EDITAR LEMBRETE
          </Text>

          <TouchableOpacity
            onPress={confirmarExclusao}
            style={estilos.iconeExcluir}
          >
            <FontAwesome
              name="trash"
              size={19}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* INFORMAÇÕES */}
        <View style={estilos.painel}>
          <CampoTexto
            label="Título"
            placeholder="Título do lembrete"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={80}
          />

          <CampoTexto
            label="Observações"
            placeholder="Adicione detalhes (opcional)"
            value={nota}
            onChangeText={setNota}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* DATA E HORÁRIO */}
        <View style={estilos.painel}>
          <Text style={estilos.labelPainel}>
            Data e horário
          </Text>

          <TouchableOpacity
            style={estilos.seletor}
            onPress={abrirCalendario}
            activeOpacity={0.7}
          >
            <FontAwesome
              name="calendar"
              size={21}
              color={cores.primario}
            />

            <View style={estilos.textosSeletor}>
              <Text style={estilos.labelSeletor}>
                Data
              </Text>

              <Text style={estilos.valorSeletor}>
                {dataLegivel(dataSelecionada)}
              </Text>
            </View>

            <FontAwesome
              name="chevron-right"
              size={14}
              color={cores.textoSecundario}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.seletor}
            onPress={abrirRelogio}
            activeOpacity={0.7}
          >
            <FontAwesome
              name="clock-o"
              size={23}
              color={cores.primario}
            />

            <View style={estilos.textosSeletor}>
              <Text style={estilos.labelSeletor}>
                Horário
              </Text>

              <Text style={estilos.valorSeletor}>
                {formatarHorario(horarioSelecionado)}
              </Text>
            </View>

            <FontAwesome
              name="chevron-right"
              size={14}
              color={cores.textoSecundario}
            />
          </TouchableOpacity>
        </View>

        {/* PRIORIDADE */}
        <View style={estilos.painelPrioridade}>
          <Text style={estilos.labelPainel}>
            Prioridade do lembrete
          </Text>

          <Text style={estilos.descricaoPrioridade}>
            Escolha a importância deste lembrete.
          </Text>

          <View style={estilos.opcoesPrioridade}>
            {opcoesPrioridade.map((opcao) => {
              const selecionada = prioridade === opcao.id;

              return (
                <TouchableOpacity
                  key={opcao.id}
                  style={[
                    estilos.opcaoPrioridade,
                    {
                      backgroundColor: selecionada
                        ? opcao.fundo
                        : cores.campo,
                      borderColor: selecionada
                        ? opcao.cor
                        : cores.borda,
                    },
                  ]}
                  onPress={() => setPrioridade(opcao.id)}
                  activeOpacity={0.75}
                >
                  <FontAwesome
                    name={opcao.icone}
                    size={19}
                    color={opcao.cor}
                  />

                  <Text
                    style={[
                      estilos.textoPrioridade,
                      { color: opcao.cor },
                    ]}
                  >
                    {opcao.nome}
                  </Text>

                  {selecionada && (
                    <FontAwesome
                      name="check-circle"
                      size={13}
                      color={opcao.cor}
                      style={{ marginTop: 5 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* REPETIÇÃO DIÁRIA */}
        <View style={estilos.opcaoDiaria}>
          <View style={estilos.textoDiario}>
            <Text style={estilos.tituloDiario}>
              Repetir diariamente
            </Text>

            <Text style={estilos.descricaoDiario}>
              Marque se este lembrete for diário.
            </Text>
          </View>

          <Switch
            value={diario}
            onValueChange={setDiario}
            trackColor={{
              false: modoEscuro ? '#4B5563' : '#CBD5E1',
              true: '#93C5FD',
            }}
            thumbColor={diario ? cores.primario : '#F8FAFC'}
          />
        </View>

        {/* BOTÕES */}
        <View style={estilos.botoes}>
          <View style={estilos.botaoMetade}>
            <Botao
              titulo="CANCELAR"
              onPress={() => router.back()}
              cor="#EF4444"
            />
          </View>

          <View style={estilos.botaoMetade}>
            <Botao
              titulo="SALVAR"
              onPress={salvar}
              cor="#16A34A"
              carregando={salvando}
            />
          </View>
        </View>

        {/* EXCLUIR */}
        <TouchableOpacity
          style={estilos.botaoExcluir}
          onPress={confirmarExclusao}
        >
          <FontAwesome
            name="trash"
            size={17}
            color="#FFFFFF"
          />

          <Text style={estilos.textoExcluir}>
            EXCLUIR LEMBRETE
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL DE DATA - IOS */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={mostrarCalendario}
          transparent
          animationType="fade"
          onRequestClose={() => setMostrarCalendario(false)}
        >
          <View style={estilos.modalFundo}>
            <View style={estilos.modalConteudo}>
              <Text style={estilos.modalTitulo}>
                Escolher data
              </Text>

              <View style={estilos.seletorIOS}>
                <DateTimePicker
                  value={dataSelecionada}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date(new Date().setHours(0, 0, 0, 0))}
                  onChange={alterarData}
                  locale="pt-BR"
                  themeVariant={modoEscuro ? 'dark' : 'light'}
                  accentColor={cores.primario}
                />
              </View>

              <View style={estilos.botoesModal}>
                <TouchableOpacity
                  style={[
                    estilos.botaoModal,
                    { backgroundColor: '#EF4444' },
                  ]}
                  onPress={() => setMostrarCalendario(false)}
                >
                  <Text style={estilos.textoBotaoModal}>
                    CANCELAR
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    estilos.botaoModal,
                    { backgroundColor: '#16A34A' },
                  ]}
                  onPress={() => setMostrarCalendario(false)}
                >
                  <Text style={estilos.textoBotaoModal}>
                    CONFIRMAR
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* MODAL DE HORÁRIO - IOS */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={mostrarRelogio}
          transparent
          animationType="fade"
          onRequestClose={() => setMostrarRelogio(false)}
        >
          <View style={estilos.modalFundo}>
            <View style={estilos.modalConteudo}>
              <Text style={estilos.modalTitulo}>
                Escolher horário
              </Text>

              <View style={estilos.seletorIOS}>
                <DateTimePicker
                  value={horarioSelecionado}
                  mode="time"
                  display="spinner"
                  is24Hour
                  onChange={alterarHorario}
                  locale="pt-BR"
                  themeVariant={modoEscuro ? 'dark' : 'light'}
                  accentColor={cores.primario}
                />
              </View>

              <View style={estilos.botoesModal}>
                <TouchableOpacity
                  style={[
                    estilos.botaoModal,
                    { backgroundColor: '#EF4444' },
                  ]}
                  onPress={() => setMostrarRelogio(false)}
                >
                  <Text style={estilos.textoBotaoModal}>
                    CANCELAR
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    estilos.botaoModal,
                    { backgroundColor: '#16A34A' },
                  ]}
                  onPress={() => setMostrarRelogio(false)}
                >
                  <Text style={estilos.textoBotaoModal}>
                    CONFIRMAR
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}