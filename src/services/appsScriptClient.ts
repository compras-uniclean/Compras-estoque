export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  version?: string;
  modoTeste?: boolean;
  method?: string;
  timestamp?: string;
};

export type DashboardCard = {
  situacao: string;
  qtdAComprar: number;
  tipo: string;
  codigo: string;
  descricao: string;
  estoqueAtual: number;
  disponivel: number;
  reservado: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  abc3Meses: string;
  abcAnoPassado: string;
};

export type DashboardCompras = {
  total: number;
  cards: DashboardCard[];
};

export type Fornecedor = {
  codigo: string;
  nome: string;
  email: string;
  telefone: string;
  dataCotacao: string;
  ultimoEnvio: string;
  status: string;
  cidade: string;
  cnpjEmitente: string;
};

export type FornecedoresResponse = {
  total: number;
  fornecedores: Fornecedor[];
};

export type ListasBasicas = {
  status: string[];
  embalagens: string[];
};

export type CotacaoFornecedor = {
  idCotacaoFornecedor: string;
  idCotacao: string;
  codigoFornecedor: string;
  nomeFornecedor: string;
  email: string;
  quantidadeSolicitada: number;
  embalagem: string;
  status: string;
  formUrl: string;
  enviadoEm: string;
  respondidoEm: string;
  motivoReprovacao: string;
  numeroOc: string;
  observacoes: string;
};

export type Cotacao = {
  idCotacao: string;
  codigoItem: string;
  descricaoItem: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  quantidadeSugerida: number;
  quantidadeSolicitada: number;
  embalagem: string;
  status: string;
  criadoPor: string;
  criadoEm: string;
  enviadoEm: string;
  observacoes: string;
  fornecedores: CotacaoFornecedor[];
};

export type ListarCotacoesResponse = {
  total: number;
  cotacoes: Cotacao[];
};

export type FornecedorCotacaoPayload = {
  codigo: string;
  nome: string;
  email: string;
};

export type CriarCotacaoPayload = {
  codigoItem: string;
  descricaoItem: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  quantidadeSugerida: number;
  quantidadeSolicitada: number;
  embalagem: string;
  fornecedores: FornecedorCotacaoPayload[];
};

export type CriarCotacaoResponse = {
  mensagem: string;
  idCotacao: string;
  fornecedoresCriados: Array<{
    idCotacaoFornecedor: string;
    codigo: string;
    nome: string;
    email: string;
    status: string;
  }>;
};

export type EnviarCotacoesResponse = {
  mensagem: string;
  idCotacao: string;
  status: string;
  fornecedoresAtualizados: number;
  envioReal: boolean;
};

export type RetornoFornecedorTipo =
  | 'aprovada'
  | 'prazo_expirado'
  | 'custo_acima'
  | 'prazo_entrega_incompativel'
  | 'validade_curta'
  | 'outros';

export type RetornarFornecedorPayload = {
  idCotacaoFornecedor: string;
  retorno: RetornoFornecedorTipo;
  numeroOc?: string;
  motivoOutros?: string;
};

export type RetornarFornecedorResponse = {
  mensagem: string;
  idCotacao: string;
  idCotacaoFornecedor: string;
  fornecedor: string;
  email: string;
  status: string;
  numeroOc: string;
  motivoReprovacao: string;
  envioReal: boolean;
};

const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined;
const API_TOKEN = import.meta.env.VITE_APPS_SCRIPT_TOKEN as string | undefined;

function getConfig() {
  if (!API_URL) {
    throw new Error('Configure VITE_APPS_SCRIPT_URL no ambiente do app.');
  }

  if (!API_TOKEN) {
    throw new Error('Configure VITE_APPS_SCRIPT_TOKEN no ambiente do app.');
  }

  return { apiUrl: API_URL, token: API_TOKEN };
}

async function request<T>(
  action: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const { apiUrl, token } = getConfig();
  const url = new URL(apiUrl);

  url.searchParams.set('action', action);
  url.searchParams.set('token', token);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString());
  const result = (await response.json()) as ApiResponse<T>;

  if (!result.ok) {
    throw new Error(result.error || 'Erro desconhecido na API do Apps Script.');
  }

  if (!result.data) {
    throw new Error('A API respondeu sem dados.');
  }

  return result.data;
}

export function getDashboardCompras(limite = 30) {
  return request<DashboardCompras>('getDashboardCompras', { limite });
}

export function getFornecedores(busca = '', limite = 30) {
  return request<FornecedoresResponse>('getFornecedores', { busca, limite });
}

export function getListasBasicas() {
  return request<ListasBasicas>('getListasBasicas');
}

export function listarCotacoes(limite = 30) {
  return request<ListarCotacoesResponse>('listarCotacoes', { limite });
}

export function criarCotacao(payload: CriarCotacaoPayload) {
  return request<CriarCotacaoResponse>('criarCotacao', {
    codigo_item: payload.codigoItem,
    descricao_item: payload.descricaoItem,
    estoque_atual: payload.estoqueAtual,
    estoque_minimo: payload.estoqueMinimo,
    estoque_maximo: payload.estoqueMaximo,
    quantidade_sugerida: payload.quantidadeSugerida,
    quantidade_solicitada: payload.quantidadeSolicitada,
    embalagem: payload.embalagem,
    fornecedores_json: JSON.stringify(payload.fornecedores),
  });
}

export function enviarCotacoes(idCotacao: string) {
  return request<EnviarCotacoesResponse>('enviarCotacoes', {
    id_cotacao: idCotacao,
  });
}

export function retornarFornecedor(payload: RetornarFornecedorPayload) {
  return request<RetornarFornecedorResponse>('retornarFornecedor', {
    id_cotacao_fornecedor: payload.idCotacaoFornecedor,
    retorno: payload.retorno,
    numero_oc: payload.numeroOc || '',
    motivo_outros: payload.motivoOutros || '',
  });
}
