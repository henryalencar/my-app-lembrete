import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';

import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import CampoTexto from '../../components/campoTexto/campoTexto';
import Botao from '../../components/botao/botao';

import { useLembrete } from '../../hooks/useLembrete';
import { Lembrete, Prioridade } from '../../types/lembrete';
import { useTema } from '../../contexts/themeContexts';

function formatarData(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function formatarHorario(data: Date): string {
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');

  return `${hora}:${minuto}`;
}

function dataLegivel(data: Date): string {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function NovoLembrete() {
  const router = useRouter();
  const { adicionar } = useLembrete();
  const { cores, tema } = useTema();

  const modoEscuro = tema === 'escuro';

  const [titulo, setTitulo] = useState('');
  const [nota, setNota] = useState('');

  const [dataSelecionada, setDataSelecionada] = useState(new Date());

  const [horarioSelecionado, setHorarioSelecionado] = useState(() => {
    const agora = new Date();
    agora.setSeconds(0);
    agora.setMilliseconds(0);
    return agora;
  });

  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarRelogio, setMostrarRelogio] = useState(false);

  const [diario, setDiario] = useState(false);
  const [salvando, setSalvando] = useState(false);


  const [prioridade, setPrioridade] = useState<Prioridade>('media');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: cores.fundo,
    },

    conteudo: {
      padding: 22,
      paddingTop: 55,
      paddingBottom: 40,
    },

    cabecalho: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 28,
      minHeight: 42,
    },

    voltar: {
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

    painel: {
      backgroundColor: cores.superficie,
      borderRadius: 17,
      padding: 17,
      marginBottom: 18,
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

    opcaoDiaria: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: cores.superficie,
      borderRadius: 15,
      marginBottom: 25,
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

    // ESTILOS DAS PRIORIDADES

    descricaoPrioridade: {
      fontSize: 12,
      color: cores.textoSecundario,
      marginBottom: 15,
    },

    opcoesPrioridade: {
      flexDirection: 'row',
      gap: 9,
    },

    opcaoPrioridade: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 13,
      borderRadius: 12,
      borderWidth: 1.5,
    },

    textoPrioridade: {
      fontSize: 12,
      fontWeight: '700',
      marginTop: 7,
    },
  });
 

  const opcoesPrioridade: {
    valor: Prioridade;
    nome: string;
    cor: string;
    icone: string;
    fundo: string;
  }[] = [
    {
      valor: 'baixa',
      nome: 'Baixa',
      cor: '#16A34A',
      icone: 'arrow-down',
      fundo: modoEscuro ? '#163B2A' : '#DCFCE7',
    },
    {
      valor: 'media',
      nome: 'Média',
      cor: '#CA8A04',
      icone: 'minus',
      fundo: modoEscuro ? '#423719' : '#FEF9C3',
    },
    {
      valor: 'alta',
      nome: 'Alta',
      cor: '#EF4444',
      icone: 'arrow-up',
      fundo: modoEscuro ? '#451F25' : '#FEE2E2',
    },
  ];

  function alterarData(
    evento: DateTimePickerEvent,
    novaData?: Date
  ) {
    if (Platform.OS === 'android') {
      setMostrarCalendario(false);
    }

    if (evento.type === 'set' && novaData) {
      setDataSelecionada(novaData);
    }
  }

  function alterarHorario(
    evento: DateTimePickerEvent,
    novoHorario?: Date
  ) {
    if (Platform.OS === 'android') {
      setMostrarRelogio(false);
    }

    if (evento.type === 'set' && novoHorario) {
      setHorarioSelecionado(novoHorario);
    }
  }

  async function salvar() {
    if (salvando) return;

    if (!titulo.trim()) {
      Alert.alert('Atenção', 'Digite o título do lembrete.');
      return;
    }

    const agora = new Date();

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataSelecionada < hoje) {
      Alert.alert('Atenção', 'Escolha uma data de hoje em diante.');
      return;
    }

    const dataHora = new Date(dataSelecionada);

    dataHora.setHours(
      horarioSelecionado.getHours(),
      horarioSelecionado.getMinutes(),
      0,
      0
    );

    if (dataHora <= agora) {
      Alert.alert('Atenção', 'Escolha um horário futuro.');
      return;
    }

    const novoLembrete: Lembrete = {
      id: Date.now().toString(),
      titulo: titulo.trim(),
      nota: nota.trim(),
      data: formatarData(dataSelecionada),
      horario: formatarHorario(horarioSelecionado),
      concluido: false,
      diario,
      criadoEm: new Date().toISOString(),
      concluidoEm: null,
      prioridade,
    };

    try {
      setSalvando(true);

      await adicionar(novoLembrete);

      router.back();

    } catch (erro) {
      console.error('Erro ao salvar lembrete:', erro);

      Alert.alert(
        'Erro',
        'Não foi possível salvar o lembrete. Tente novamente.'
      );

    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
    

      <View style={styles.cabecalho}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.voltar}
        >
          <FontAwesome
            name="arrow-left"
            size={21}
            color={cores.texto}
          />
        </TouchableOpacity>

        <Text style={styles.tituloTela}>
          NOVO LEMBRETE
        </Text>
      </View>



      <View style={styles.painel}>
        <CampoTexto
          label="Título"
          placeholder="Ex.: Estudar programação"
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

     

      <View style={styles.painel}>
        <Text style={styles.labelPainel}>
          Data e horário
        </Text>

        <TouchableOpacity
          style={styles.seletor}
          onPress={() => setMostrarCalendario(true)}
          activeOpacity={0.7}
        >
          <FontAwesome
            name="calendar"
            size={21}
            color={cores.primario}
          />

          <View style={styles.textosSeletor}>
            <Text style={styles.labelSeletor}>Data</Text>

            <Text style={styles.valorSeletor}>
              {dataLegivel(dataSelecionada)}
            </Text>
          </View>

          <FontAwesome
            name="chevron-right"
            size={14}
            color={cores.textoSecundario}
          />
        </TouchableOpacity>

        {mostrarCalendario && (
          <DateTimePicker
            value={dataSelecionada}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date(new Date().setHours(0, 0, 0, 0))}
            onChange={alterarData}
            themeVariant={modoEscuro ? 'dark' : 'light'}
            accentColor={cores.primario}
          />
        )}

        <TouchableOpacity
          style={styles.seletor}
          onPress={() => setMostrarRelogio(true)}
          activeOpacity={0.7}
        >
          <FontAwesome
            name="clock-o"
            size={23}
            color={cores.primario}
          />

          <View style={styles.textosSeletor}>
            <Text style={styles.labelSeletor}>Horário</Text>

            <Text style={styles.valorSeletor}>
              {formatarHorario(horarioSelecionado)}
            </Text>
          </View>

          <FontAwesome
            name="chevron-right"
            size={14}
            color={cores.textoSecundario}
          />
        </TouchableOpacity>

        {mostrarRelogio && (
          <DateTimePicker
            value={horarioSelecionado}
            mode="time"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={alterarHorario}
            themeVariant={modoEscuro ? 'dark' : 'light'}
            accentColor={cores.primario}
          />
        )}
      </View>

     

      <View style={styles.painel}>
        <Text style={styles.labelPainel}>
          Prioridade do lembrete
        </Text>

        <Text style={styles.descricaoPrioridade}>
          Escolha o nível de importância desta tarefa.
        </Text>

        <View style={styles.opcoesPrioridade}>
          {opcoesPrioridade.map((opcao) => {
            const selecionada = prioridade === opcao.valor;

            return (
              <TouchableOpacity
                key={opcao.valor}
                activeOpacity={0.7}
                onPress={() => setPrioridade(opcao.valor)}
                style={[
                  styles.opcaoPrioridade,
                  {
                    backgroundColor: selecionada
                      ? opcao.fundo
                      : cores.campo,

                    borderColor: selecionada
                      ? opcao.cor
                      : cores.borda,
                  },
                ]}
              >
                <FontAwesome
                  name={opcao.icone as any}
                  size={18}
                  color={opcao.cor}
                />

                <Text
                  style={[
                    styles.textoPrioridade,
                    {
                      color: selecionada
                        ? opcao.cor
                        : cores.textoSecundario,
                    },
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

      

      <View style={styles.opcaoDiaria}>
        <View style={styles.textoDiario}>
          <Text style={styles.tituloDiario}>
            Repetir diariamente
          </Text>

          <Text style={styles.descricaoDiario}>
            Marque se este lembrete for diário.
          </Text>
        </View>

        <Switch
          value={diario}
          onValueChange={setDiario}
          trackColor={{
            false: '#CBD5E1',
            true: '#93C5FD',
          }}
          thumbColor={diario ? '#2563EB' : '#F8FAFC'}
        />
      </View>

      

      <View style={styles.botoes}>
        <View style={styles.botaoMetade}>
          <Botao
            titulo="CANCELAR"
            onPress={() => router.back()}
            cor="#EF4444"
          />
        </View>

        <View style={styles.botaoMetade}>
          <Botao
            titulo="SALVAR"
            onPress={salvar}
            cor="#16A34A"
            carregando={salvando}
          />
        </View>
      </View>
    </ScrollView>
  );
}