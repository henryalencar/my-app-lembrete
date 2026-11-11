import { Lembrete, Prioridade } from '../types/lembrete';
import { api } from './api';


function converterLembrete(dado: any): Lembrete {
  return {
    id: String(dado.id),
    titulo: dado.titulo,
    nota: dado.nota ?? '',
    data: dado.data,
    horario: String(dado.horario).slice(0, 5),
    concluido: Boolean(Number(dado.concluido)),
    diario: Boolean(Number(dado.diario)),
    criadoEm: dado.criado_em,
    concluidoEm: dado.concluido_em ?? null,

    prioridade: (dado.prioridade ?? 'media') as Prioridade,
  };
}


export async function listarLembretes(): Promise<Lembrete[]> {
  const resposta = await api('/lembretes/listar.php');

  return (resposta.dados ?? []).map(converterLembrete);
}


export async function salvarLembrete(
  lembrete: Lembrete
): Promise<Lembrete> {
  const resposta = await api('/lembretes/cadastrar.php', {
    method: 'POST',
    body: JSON.stringify({
      titulo: lembrete.titulo,
      nota: lembrete.nota,
      data: lembrete.data,
      horario: lembrete.horario,
      diario: lembrete.diario,
      prioridade: lembrete.prioridade,
    }),
  });

  return {
    ...lembrete,
    id: String(resposta.id),
    concluidoEm: null,
  };
}


export async function atualizarLembrete(
  lembrete: Lembrete
): Promise<void> {
  await api('/lembretes/editar.php', {
    method: 'PUT',
    body: JSON.stringify({
      id: Number(lembrete.id),
      titulo: lembrete.titulo,
      nota: lembrete.nota,
      data: lembrete.data,
      horario: lembrete.horario,
      diario: lembrete.diario,
      prioridade: lembrete.prioridade,
    }),
  });
}


export async function excluirLembrete(id: string): Promise<void> {
  await api('/lembretes/excluir.php', {
    method: 'DELETE',
    body: JSON.stringify({
      id: Number(id),
    }),
  });
}


export async function alternarConclusao(
  id: string,
  concluido: boolean
): Promise<void> {
  await api('/lembretes/concluir.php', {
    method: 'PUT',
    body: JSON.stringify({
      id: Number(id),
      concluido,
    }),
  });
}