export interface User {
  id: number
  name: string
  email: string
  unidade: string
}

export type CategoriaStatus = 'ativa' | 'inativa'

export interface Categoria {
  id: number
  nome: string
  descricao: string | null
  status: CategoriaStatus
  produtos_count?: number
}

export interface Fornecedor {
  id: number
  nome: string
  cnpj: string | null
  telefone: string | null
  email: string | null
}

export interface Produto {
  id: number
  codigo: string
  nome: string
  categoria_id: number | null
  fornecedor_id: number | null
  quantidade: number
  estoque_minimo: number
  estoque_maximo: number
  preco_custo: string
  categoria?: Pick<Categoria, 'id' | 'nome'> | null
  fornecedor?: Pick<Fornecedor, 'id' | 'nome'> | null
}

export type TipoMovimentacao = 'entrada' | 'saida'

export interface Movimentacao {
  id: number
  produto_id: number
  fornecedor_id: number | null
  tipo: TipoMovimentacao
  quantidade: number
  saldo_resultante: number
  data: string
  motivo: string | null
  observacao: string | null
  produto?: Pick<Produto, 'id' | 'nome' | 'codigo'>
  fornecedor?: Pick<Fornecedor, 'id' | 'nome'> | null
  user?: { id: number; name: string } | null
}

export interface MovimentacaoFiltros {
  tipo?: '' | TipoMovimentacao
  produto_id?: number | null
  data_inicio?: string
  data_fim?: string
  busca?: string
}

export interface PontoGrafico {
  data: string
  entradas: number
  saidas: number
}

export interface DashboardResumo {
  total_produtos: number
  estoque_baixo: number
  sem_estoque: number
  total_entradas: number
  total_saidas: number
  alertas: Produto[]
  ultimas_movimentacoes: Movimentacao[]
  grafico: PontoGrafico[]
}

export interface RelatorioResumo {
  estoque_atual: number
  valor_em_estoque: number
  total_entradas: number
  total_saidas: number
  produtos: Produto[]
  produtos_baixo: Produto[]
  movimentacoes: Movimentacao[]
}
