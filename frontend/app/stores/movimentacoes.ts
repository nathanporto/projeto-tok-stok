import { defineStore } from 'pinia'
import type { Movimentacao, MovimentacaoFiltros, TipoMovimentacao } from '~/types'

export interface MovimentacaoPayload {
  tipo: TipoMovimentacao
  produto_id: number
  quantidade: number
  data: string
  fornecedor_id: number | null
  motivo: string | null
  observacao: string | null
}

export const useMovimentacoesStore = defineStore('movimentacoes', () => {
  const api = useApi()
  const movimentacoes = ref<Movimentacao[]>([])
  const carregando = ref(false)

  async function fetchAll(filtros: MovimentacaoFiltros = {}) {
    carregando.value = true
    try {
      movimentacoes.value = await api.get<Movimentacao[]>(`/movimentacoes${montarQuery(filtros)}`)
    } finally {
      carregando.value = false
    }
  }

  async function registrar(payload: MovimentacaoPayload) {
    return api.post<Movimentacao>('/movimentacoes', payload)
  }

  return { movimentacoes, carregando, fetchAll, registrar }
})
