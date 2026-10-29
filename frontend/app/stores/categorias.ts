import { defineStore } from 'pinia'
import type { Categoria } from '~/types'

export type CategoriaPayload = Pick<Categoria, 'nome' | 'descricao' | 'status'>

export const useCategoriasStore = defineStore('categorias', () => {
  const api = useApi()
  const categorias = ref<Categoria[]>([])
  const carregando = ref(false)

  async function fetchAll(busca = '') {
    carregando.value = true
    try {
      const query = busca ? `?busca=${encodeURIComponent(busca)}` : ''
      categorias.value = await api.get<Categoria[]>(`/categorias${query}`)
    } finally {
      carregando.value = false
    }
  }

  async function create(payload: CategoriaPayload) {
    return api.post<Categoria>('/categorias', payload)
  }

  async function update(id: number, payload: CategoriaPayload) {
    return api.put<Categoria>(`/categorias/${id}`, payload)
  }

  async function remove(id: number) {
    await api.delete(`/categorias/${id}`)
  }

  return { categorias, carregando, fetchAll, create, update, remove }
})
