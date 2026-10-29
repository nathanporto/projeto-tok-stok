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

export interface Movimentacao {
  id: number
  produto_id: number
  fornecedor_id: number | null
  tipo: 'entrada' | 'saida'
  quantidade: number
  data: string
  motivo: string | null
  observacao: string | null
  produto?: Pick<Produto, 'id' | 'nome' | 'codigo'>
  fornecedor?: Pick<Fornecedor, 'id' | 'nome'> | null
}

export interface DashboardResumo {
  total_produtos: number
  estoque_baixo: number
  sem_estoque: number
  total_entradas: number
  total_saidas: number
  alertas: Produto[]
  ultimas_movimentacoes: Movimentacao[]
}
