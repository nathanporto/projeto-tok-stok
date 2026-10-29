import { defineStore } from 'pinia'
import type { DashboardResumo } from '~/types'

export const useDashboardStore = defineStore('dashboard', () => {
  const api = useApi()
  const resumo = ref<DashboardResumo | null>(null)
  const carregando = ref(false)

  async function fetch() {
    carregando.value = true
    try {
      resumo.value = await api.get<DashboardResumo>('/dashboard')
    } finally {
      carregando.value = false
    }
  }

  return { resumo, carregando, fetch }
})
