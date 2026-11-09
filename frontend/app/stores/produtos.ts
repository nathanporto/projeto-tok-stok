import { defineStore } from 'pinia'
import type { Produto } from '~/types'

export interface ProdutoPayload {
  codigo: string
  nome: string
  categoria_id: number | null
  fornecedor_id: number | null
  quantidade: number
  estoque_minimo: number
  estoque_maximo: number
  preco_custo: number
}

export interface ProdutoFiltros {
  busca?: string
  categoria_id?: number | null
  fornecedor_id?: number | null
  situacao?: '' | 'regular' | 'baixo' | 'sem_estoque'
}

export const useProdutosStore = defineStore('produtos', () => {
  const api = useApi()
  const produtos = ref<Produto[]>([])
  const carregando = ref(false)

  async function fetchAll(filtros: ProdutoFiltros = {}) {
    carregando.value = true
    try {
      produtos.value = await api.get<Produto[]>(`/produtos${montarQuery(filtros)}`)
    } finally {
      carregando.value = false
    }
  }

  async function create(payload: ProdutoPayload) {
    return api.post<Produto>('/produtos', payload)
  }

  async function update(id: number, payload: ProdutoPayload) {
    return api.put<Produto>(`/produtos/${id}`, payload)
  }

  async function remove(id: number) {
    await api.delete(`/produtos/${id}`)
  }

  return { produtos, carregando, fetchAll, create, update, remove }
})
