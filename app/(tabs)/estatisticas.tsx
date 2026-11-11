
import React, { useCallback, useMemo, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { useLembrete } from '../../hooks/useLembrete';
import { useTema } from '../../contexts/themeContexts';


function formatarChaveData(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}


function obterDataConclusao(data: string | null): string | null {
  if (!data) return null;

  return data.slice(0, 10);
}


function inicioDaSemana(data: Date): Date {
  const inicio = new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate()
  );

  const diaSemana = inicio.getDay();
  const diferenca = diaSemana === 0 ? -6 : 1 - diaSemana;

  inicio.setDate(inicio.getDate() + diferenca);

  return inicio;
}

export default function Estatisticas() {
  const { lembretes, carregando, carregarLembretes } = useLembrete();
  const { cores } = useTema();

  const [periodoSelecionado, setPeriodoSelecionado] = useState<
    'diario' | 'semanal'
  >('diario');


  useFocusEffect(
    useCallback(() => {
      carregarLembretes();
    }, [carregarLembretes])
  );

  const total = lembretes.length;

  const concluidos = lembretes.filter(
    item => item.concluido
  ).length;

  const pendentes = lembretes.filter(
    item => !item.concluido
  ).length;

  const diarios = lembretes.filter(
    item => item.diario && !item.concluido
  ).length;

  const progresso = total > 0
    ? Math.round((concluidos / total) * 100)
    : 0;

  
  const lembretesConcluidos = useMemo(() => {
    return lembretes.filter(
      item => item.concluido && item.concluidoEm
    );
  }, [lembretes]);

  
  const dadosDiarios = useMemo(() => {
    const hoje = new Date();
    const dados = [];

    for (let i = 6; i >= 0; i--) {
      const data = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - i
      );

      const chave = formatarChaveData(data);

      const quantidade = lembretesConcluidos.filter(
        item => obterDataConclusao(item.concluidoEm) === chave
      ).length;

      const dia = data.toLocaleDateString('pt-BR', {
        weekday: 'short',
      }).replace('.', '');

      dados.push({
        chave,
        rotulo: dia.charAt(0).toUpperCase() + dia.slice(1),
        quantidade,
      });
    }

    return dados;
  }, [lembretesConcluidos]);

 
  const dadosSemanais = useMemo(() => {
    const hoje = new Date();
    const segundaAtual = inicioDaSemana(hoje);
    const dados = [];

    for (let i = 3; i >= 0; i--) {
      const inicio = new Date(segundaAtual);
      inicio.setDate(inicio.getDate() - i * 7);

      const fim = new Date(inicio);
      fim.setDate(fim.getDate() + 6);

      const chaveInicio = formatarChaveData(inicio);
      const chaveFim = formatarChaveData(fim);

      const quantidade = lembretesConcluidos.filter(item => {
        const dataConclusao = obterDataConclusao(item.concluidoEm);

        return (
          dataConclusao !== null &&
          dataConclusao >= chaveInicio &&
          dataConclusao <= chaveFim
        );
      }).length;

      dados.push({
        chave: chaveInicio,
        rotulo: inicio.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        quantidade,
      });
    }

    return dados;
  }, [lembretesConcluidos]);

  const dadosGrafico = periodoSelecionado === 'diario'
    ? dadosDiarios
    : dadosSemanais;

  const maiorQuantidade = Math.max(
    1,
    ...dadosGrafico.map(item => item.quantidade)
  );

  const melhorResultado = Math.max(
    0,
    ...dadosGrafico.map(item => item.quantidade)
  );

  const indiceMelhorResultado = dadosGrafico.findIndex(
    item => item.quantidade === melhorResultado && melhorResultado > 0
  );

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

    titulo: {
      fontSize: 25,
      fontWeight: '800',
      color: cores.texto,
    },

    subtitulo: {
      fontSize: 14,
      color: cores.textoSecundario,
      marginTop: 7,
      marginBottom: 25,
    },

    grade: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },

    card: {
      width: '48%',
      backgroundColor: cores.superficie,
      borderRadius: 17,
      padding: 17,
      borderWidth: 1,
      borderColor: cores.borda,
    },

    icone: {
      marginBottom: 15,
    },

    numero: {
      fontSize: 28,
      fontWeight: '800',
      color: cores.texto,
    },

    descricao: {
      fontSize: 13,
      color: cores.textoSecundario,
      marginTop: 5,
    },

    painel: {
      backgroundColor: cores.superficie,
      borderRadius: 17,
      padding: 20,
      marginTop: 22,
      borderWidth: 1,
      borderColor: cores.borda,
    },

    tituloPainel: {
      fontSize: 17,
      fontWeight: '700',
      color: cores.texto,
    },

    textoPainel: {
      fontSize: 13,
      color: cores.textoSecundario,
      marginTop: 7,
      lineHeight: 19,
    },

    barraFundo: {
      height: 12,
      backgroundColor: cores.borda,
      borderRadius: 20,
      overflow: 'hidden',
      marginTop: 18,
    },

    barraPreenchida: {
      height: '100%',
      backgroundColor: '#16A34A',
      borderRadius: 20,
    },

    porcentagem: {
      fontSize: 25,
      fontWeight: '800',
      color: cores.primario,
      marginTop: 15,
    },

    seletor: {
      flexDirection: 'row',
      backgroundColor: cores.campo,
      borderRadius: 12,
      padding: 4,
      marginTop: 20,
      marginBottom: 25,
    },

    opcao: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 11,
      borderRadius: 9,
    },

    opcaoAtiva: {
      backgroundColor: cores.primario,
    },

    textoOpcao: {
      fontSize: 13,
      fontWeight: '600',
      color: cores.textoSecundario,
    },

    textoOpcaoAtiva: {
      color: '#FFFFFF',
    },

    grafico: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      height: 155,
    },

    coluna: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },

    quantidade: {
      fontSize: 12,
      fontWeight: '700',
      color: cores.texto,
      marginBottom: 7,
    },

    barraArea: {
      height: 110,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },

    barra: {
      width: 22,
      borderTopLeftRadius: 7,
      borderTopRightRadius: 7,
    },

    rotuloGrafico: {
      fontSize: 11,
      color: cores.textoSecundario,
      marginTop: 10,
      textAlign: 'center',
    },

    legenda: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 22,
    },

    pontoLegenda: {
      width: 9,
      height: 9,
      borderRadius: 10,
      backgroundColor: cores.primario,
      marginRight: 8,
    },

    textoLegenda: {
      fontSize: 12,
      color: cores.textoSecundario,
    },

    destaque: {
      marginTop: 20,
      padding: 15,
      borderRadius: 12,
      backgroundColor: cores.cartao,
      flexDirection: 'row',
      alignItems: 'center',
    },

    textoDestaque: {
      flex: 1,
      marginLeft: 12,
      fontSize: 13,
      color: cores.texto,
      lineHeight: 19,
    },

    vazio: {
      alignItems: 'center',
      marginTop: 25,
      padding: 15,
    },

    textoVazio: {
      color: cores.textoSecundario,
      fontSize: 13,
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 19,
    },
  });

  if (carregando) {
    return (
      <View style={[
        styles.container,
        { justifyContent: 'center', alignItems: 'center' }
      ]}>
        <ActivityIndicator
          size="large"
          color={cores.primario}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
    >
      <Text style={styles.titulo}>
        Estatísticas
      </Text>

      <Text style={styles.subtitulo}>
        Acompanhe seu desempenho e seus lembretes.
      </Text>

      
      <View style={styles.grade}>
        <View style={styles.card}>
          <FontAwesome
            name="clipboard"
            size={24}
            color="#2563EB"
            style={styles.icone}
          />

          <Text style={styles.numero}>{total}</Text>

          <Text style={styles.descricao}>
            Total de lembretes
          </Text>
        </View>

        <View style={styles.card}>
          <FontAwesome
            name="check-circle"
            size={24}
            color="#16A34A"
            style={styles.icone}
          />

          <Text style={styles.numero}>{concluidos}</Text>

          <Text style={styles.descricao}>
            Concluídos
          </Text>
        </View>

        <View style={styles.card}>
          <FontAwesome
            name="clock-o"
            size={24}
            color="#D97706"
            style={styles.icone}
          />

          <Text style={styles.numero}>{pendentes}</Text>

          <Text style={styles.descricao}>
            Pendentes
          </Text>
        </View>

        <View style={styles.card}>
          <FontAwesome
            name="repeat"
            size={24}
            color="#9333EA"
            style={styles.icone}
          />

          <Text style={styles.numero}>{diarios}</Text>

          <Text style={styles.descricao}>
            Diários ativos
          </Text>
        </View>
      </View>

      
      <View style={styles.painel}>
        <Text style={styles.tituloPainel}>
          Progresso geral
        </Text>

        <Text style={styles.textoPainel}>
          {concluidos} de {total} lembretes concluídos
        </Text>

        <View style={styles.barraFundo}>
          <View
            style={[
              styles.barraPreenchida,
              { width: `${progresso}%` },
            ]}
          />
        </View>

        <Text style={styles.porcentagem}>
          {progresso}%
        </Text>
      </View>

     
      <View style={styles.painel}>
        <Text style={styles.tituloPainel}>
          Desempenho
        </Text>

        <Text style={styles.textoPainel}>
          Veja quantos lembretes você concluiu ao longo do tempo.
        </Text>

       
        <View style={styles.seletor}>
          <TouchableOpacity
            style={[
              styles.opcao,
              periodoSelecionado === 'diario' && styles.opcaoAtiva,
            ]}
            onPress={() => setPeriodoSelecionado('diario')}
          >
            <Text style={[
              styles.textoOpcao,
              periodoSelecionado === 'diario' && styles.textoOpcaoAtiva,
            ]}>
              Diário
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.opcao,
              periodoSelecionado === 'semanal' && styles.opcaoAtiva,
            ]}
            onPress={() => setPeriodoSelecionado('semanal')}
          >
            <Text style={[
              styles.textoOpcao,
              periodoSelecionado === 'semanal' && styles.textoOpcaoAtiva,
            ]}>
              Semanal
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.textoPainel}>
          {periodoSelecionado === 'diario'
            ? 'Lembretes concluídos nos últimos 7 dias'
            : 'Lembretes concluídos nas últimas 4 semanas'}
        </Text>

       
        <View style={styles.grafico}>
          {dadosGrafico.map((item, index) => {
            const altura = item.quantidade > 0
              ? Math.max(
                  8,
                  (item.quantidade / maiorQuantidade) * 110
                )
              : 3;

            const melhor = index === indiceMelhorResultado;

            return (
              <View
                key={item.chave}
                style={styles.coluna}
              >
                <Text style={styles.quantidade}>
                  {item.quantidade}
                </Text>

                <View style={styles.barraArea}>
                  <View
                    style={[
                      styles.barra,
                      {
                        height: altura,
                        backgroundColor: melhor
                          ? '#16A34A'
                          : cores.primario,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.rotuloGrafico}>
                  {item.rotulo}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.legenda}>
          <View style={styles.pontoLegenda} />

          <Text style={styles.textoLegenda}>
            Lembretes concluídos
          </Text>
        </View>

       
        {melhorResultado > 0 && (
          <View style={styles.destaque}>
            <FontAwesome
              name="trophy"
              size={22}
              color="#D97706"
            />

            <Text style={styles.textoDestaque}>
              Seu melhor resultado foi de{' '}
              <Text style={{ fontWeight: '800' }}>
                {melhorResultado} lembrete(s)
              </Text>{' '}
              {periodoSelecionado === 'diario'
                ? 'em um dia.'
                : 'em uma semana.'}
            </Text>
          </View>
        )}

        {lembretesConcluidos.length === 0 && (
          <View style={styles.vazio}>
            <FontAwesome
              name="bar-chart"
              size={32}
              color={cores.textoSecundario}
            />

            <Text style={styles.textoVazio}>
              Ainda não temos conclusões registradas para montar seu histórico.
              Conclua alguns lembretes e acompanhe seu desempenho aqui!
            </Text>
          </View>
        )}
      </View>

      {total === 0 && (
        <View style={styles.vazio}>
          <FontAwesome
            name="clipboard"
            size={35}
            color={cores.textoSecundario}
          />

          <Text style={styles.textoVazio}>
            Você ainda não possui lembretes cadastrados.
            Comece criando seu primeiro lembrete!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
