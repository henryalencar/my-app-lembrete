
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

type Tema = 'claro' | 'escuro';

export const opcoesCores = [
  {
    id: 'azul',
    nome: 'Azul',
    claro: '#2563EB',
    escuro: '#60A5FA',
    cartaoClaro: '#EAF4FF',
  },
  {
    id: 'vermelho',
    nome: 'Vermelho',
    claro: '#EF4444',
    escuro: '#F87171',
    cartaoClaro: '#FEE2E2',
  },
  {
    id: 'laranja',
    nome: 'Laranja',
    claro: '#F97316',
    escuro: '#FB923C',
    cartaoClaro: '#FFEDD5',
  },
  {
    id: 'rosa',
    nome: 'Rosa',
    claro: '#EC4899',
    escuro: '#F472B6',
    cartaoClaro: '#FCE7F3',
  },
  {
    id: 'roxo',
    nome: 'Roxo',
    claro: '#8B5CF6',
    escuro: '#A78BFA',
    cartaoClaro: '#EDE9FE',
  },
  {
    id: 'verde',
    nome: 'Verde',
    claro: '#16A34A',
    escuro: '#4ADE80',
    cartaoClaro: '#DCFCE7',
  },
  {
    id: 'ciano',
    nome: 'Ciano',
    claro: '#0891B2',
    escuro: '#22D3EE',
    cartaoClaro: '#CFFAFE',
  },
  {
    id: 'amarelo',
    nome: 'Amarelo',
    claro: '#CA8A04',
    escuro: '#FACC15',
    cartaoClaro: '#FEF9C3',
  },
  {
    id: 'indigo',
    nome: 'Índigo',
    claro: '#4F46E5',
    escuro: '#818CF8',
    cartaoClaro: '#E0E7FF',
  },
] as const;

export type CorDestaque = typeof opcoesCores[number]['id'];

type Cores = {
  fundo: string;
  superficie: string;
  texto: string;
  textoSecundario: string;
  borda: string;
  primario: string;
  cartao: string;
  campo: string;
};

const coresClaro = {
  fundo: '#FFFFFF',
  superficie: '#F8FAFC',
  texto: '#111827',
  textoSecundario: '#64748B',
  borda: '#E2E8F0',
  campo: '#F1F5F9',
};

const coresEscuro = {
  fundo: '#111827',
  superficie: '#1F2937',
  texto: '#F9FAFB',
  textoSecundario: '#9CA3AF',
  borda: '#374151',
  campo: '#374151',
};

type ThemeContextType = {
  tema: Tema;
  cores: Cores;
  corDestaque: CorDestaque;
  alterarCorPrimaria: (cor: CorDestaque) => void;
  alternarTema: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>('claro');
  const [corDestaque, setCorDestaque] = useState<CorDestaque>('azul');

  // CARREGAR PREFERÊNCIAS SALVAS

  useEffect(() => {
    async function carregarPreferencias() {
      try {
        const [temaSalvo, corSalva] = await Promise.all([
          AsyncStorage.getItem('@MyLembrete:tema'),
          AsyncStorage.getItem('@MyLembrete:cor'),
        ]);

        if (temaSalvo === 'claro' || temaSalvo === 'escuro') {
          setTema(temaSalvo);
        }

        const corValida = opcoesCores.some(
          (item) => item.id === corSalva
        );

        if (corValida) {
          setCorDestaque(corSalva as CorDestaque);
        }
      } catch (erro) {
        console.log('Erro ao carregar preferências:', erro);
      }
    }

    carregarPreferencias();
  }, []);

  // ALTERNAR TEMA

  async function alternarTema() {
    const novoTema = tema === 'claro' ? 'escuro' : 'claro';

    setTema(novoTema);

    try {
      await AsyncStorage.setItem('@MyLembrete:tema', novoTema);
    } catch (erro) {
      console.log('Erro ao salvar tema:', erro);
    }
  }

  // ALTERAR COR DE DESTAQUE

  async function alterarCorPrimaria(cor: CorDestaque) {
    setCorDestaque(cor);

    try {
      await AsyncStorage.setItem('@MyLembrete:cor', cor);
    } catch (erro) {
      console.log('Erro ao salvar cor:', erro);
    }
  }

  // CORES ATUAIS

  const corAtual = opcoesCores.find(
    (item) => item.id === corDestaque
  ) ?? opcoesCores[0];

  const cores: Cores = tema === 'claro'
    ? {
        ...coresClaro,
        primario: corAtual.claro,
        cartao: corAtual.cartaoClaro,
      }
    : {
        ...coresEscuro,
        primario: corAtual.escuro,
        cartao: '#263449',
      };

  return (
    <ThemeContext.Provider
      value={{
        tema,
        cores,
        corDestaque,
        alterarCorPrimaria,
        alternarTema,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTema() {
  const contexto = useContext(ThemeContext);

  if (!contexto) {
    throw new Error('useTema deve ser usado dentro de ThemeProvider.');
  }

  return contexto;
}
