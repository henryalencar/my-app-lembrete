
const API_URL = 'http://10.0.2.2/apiLembreteFinal/api';

type OpcoesAPI = RequestInit;

export async function api(
  endpoint: string,
  opcoes: OpcoesAPI = {}
): Promise<any> {
  try {
    const resposta = await fetch(`${API_URL}${endpoint}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        ...opcoes.headers,
      },
    });

    const texto = await resposta.text();

    let dados: any = {};

    try {
      dados = texto ? JSON.parse(texto) : {};
    } catch {
      throw new Error('A API retornou uma resposta inválida.');
    }

    if (!resposta.ok || dados.sucesso === false) {
      throw new Error(
        dados.mensagem || `Erro na comunicação com a API (${resposta.status}).`
      );
    }

    return dados;
  } catch (erro) {
    console.error('Erro na comunicação com a API:', erro);

    if (erro instanceof Error) {
      throw erro;
    }

    throw new Error('Não foi possível conectar à API.');
  }
}
