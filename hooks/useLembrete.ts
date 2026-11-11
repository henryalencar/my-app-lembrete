
import { useCallback, useEffect, useState } from 'react';

import { Lembrete } from '../types/lembrete';

import {
  listarLembretes,
  salvarLembrete,
  atualizarLembrete,
  excluirLembrete,
  alternarConclusao,
} from '../services/lembreteService';

export function useLembrete() {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [carregando, setCarregando] = useState(true);


  const carregarLembretes = useCallback(async () => {  
  // Código para carregar os lembretes, O problema era o ciclo de atualização do aplicativo, que interferia no funcionamento da tela.
  // Na primeira versão, a função dependia de lembretes. Quando a lista mudavaa a função era criada novamente.
  //Isso causava um ciclo de atualização infinita, pois a função era chamada no useEffect, que dependia da função.
    try {                                              
      const dados = await listarLembretes();
      setLembretes(dados);
    } catch (erro) {
      console.error('Erro ao carregar lembretes:', erro);
    } finally {
      setCarregando(false);
    }
  }, []);

  
  useEffect(() => {
    carregarLembretes();
  }, [carregarLembretes]);

  
  async function adicionar(lembrete: Lembrete) {
    try {
      await salvarLembrete(lembrete);
      await carregarLembretes();
    } catch (erro) {
      console.error('Erro ao adicionar lembrete:', erro);
      throw erro;
    }
  }

 
  async function editar(lembrete: Lembrete) {
    try {
      await atualizarLembrete(lembrete);
      await carregarLembretes();
    } catch (erro) {
      console.error('Erro ao editar lembrete:', erro);
      throw erro;
    }
  }


  async function remover(id: string) {
    try {
      await excluirLembrete(id);
      await carregarLembretes();
    } catch (erro) {
      console.error('Erro ao excluir lembrete:', erro);
      throw erro;
    }
  }


  async function concluir(id: string) {
    try {
      const lembrete = lembretes.find(
        (item) => item.id === id
      );

      if (!lembrete) {
        throw new Error('Lembrete não encontrado.');
      }

      await alternarConclusao(id, !lembrete.concluido);
      await carregarLembretes();
    } catch (erro) {
      console.error('Erro ao concluir lembrete:', erro);
      throw erro;
    }
  }

  return {
    lembretes,
    carregando,
    adicionar,
    editar,
    remover,
    concluir,
    carregarLembretes,
  };
}
