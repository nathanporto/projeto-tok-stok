import { defineStore } from 'pinia'
import type { Fornecedor } from '~/types'

export type FornecedorPayload = Omit<Fornecedor, 'id'>

export const useFornecedoresStore = defineStore('fornecedores', () => {
  const api = useApi()
  const fornecedores = ref<Fornecedor[]>([])
  const carregando = ref(false)

  async function fetchAll(busca = '') {
    carregando.value = true
    try {
      const query = busca ? `?busca=${encodeURIComponent(busca)}` : ''
      fornecedores.value = await api.get<Fornecedor[]>(`/fornecedores${query}`)
    } finally {
      carregando.value = false
    }
  }

  async function create(payload: FornecedorPayload) {
    return api.post<Fornecedor>('/fornecedores', payload)
  }

  async function update(id: number, payload: FornecedorPayload) {
    return api.put<Fornecedor>(`/fornecedores/${id}`, payload)
  }

  async function remove(id: number) {
    await api.delete(`/fornecedores/${id}`)
  }

  return { fornecedores, carregando, fetchAll, create, update, remove }
})
