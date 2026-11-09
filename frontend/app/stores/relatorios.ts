import { defineStore } from 'pinia'
import type { RelatorioResumo } from '~/types'

export interface RelatorioFiltros {
  produto_id?: number | null
  data_inicio?: string
  data_fim?: string
}

export const useRelatoriosStore = defineStore('relatorios', () => {
  const api = useApi()
  const relatorio = ref<RelatorioResumo | null>(null)
  const carregando = ref(false)

  async function fetch(filtros: RelatorioFiltros = {}) {
    carregando.value = true
    try {
      relatorio.value = await api.get<RelatorioResumo>(`/relatorios${montarQuery(filtros)}`)
    } finally {
      carregando.value = false
    }
  }

  return { relatorio, carregando, fetch }
})
