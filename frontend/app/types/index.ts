export interface User {
  id: number
  name: string
  email: string
  unidade: string
}

export type StatusEstoque = 'Regular' | 'Abaixo do mín.' | 'Sem estoque'

export interface Produto {
  id: number
  codigo: string
  nome: string
  categoria: string
  local: string
  qtd: number
  minimo: number
  maximo: number
  precoCusto: number
  fornecedor: string
}

export interface Categoria {
  id: number
  nome: string
  descricao: string
  status: 'Ativa' | 'Inativa'
}

export interface Fornecedor {
  id: number
  nome: string
  cnpj: string
  telefone: string
  email: string
}

export interface Movimentacao {
  id: number
  data: string
  tipo: 'ENTRADA' | 'SAÍDA'
  produto: string
  quantidade: number
  responsavelOuMotivo: string
  documento: string
  saldo: number
}
