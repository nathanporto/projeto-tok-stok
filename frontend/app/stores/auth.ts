import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const api = useApi()
  const user = ref<User | null>(null)
  const token = useCookie<string | null>('tokstok_token', { maxAge: 60 * 60 * 24 })

  const isAuthenticated = computed(() => !!token.value)

  async function login(usuario: string, senha: string, unidade: string, manterConectado: boolean) {
    const data = await api.post<{ token: string; user: User }>('/auth/login', {
      email: usuario,
      password: senha,
      unidade,
    })
    token.value = data.token
    user.value = data.user

    if (!manterConectado) {
      // Sessão expira ao fechar o navegador (sem maxAge persistido).
      token.value = data.token
    }

    await navigateTo('/dashboard')
  }

  async function logout() {
    await api.post('/auth/logout', {}).catch(() => {})
    token.value = null
    user.value = null
    await navigateTo('/login')
  }

  async function fetchUser() {
    if (!token.value) return
    user.value = await api.get<User>('/auth/me')
  }

  return { user, token, isAuthenticated, login, logout, fetchUser }
})
