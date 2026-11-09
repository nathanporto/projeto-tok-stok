import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const api = useApi()
  const user = ref<User | null>(null)
  // Mesmo cookie, duas formas de gravar: com maxAge ele sobrevive ao fechar o
  // navegador (dura o mesmo que o JWT, 24h); sem maxAge vira cookie de sessão.
  const token = useCookie<string | null>('tokstok_token', { maxAge: 60 * 60 * 24 })
  const tokenSessao = useCookie<string | null>('tokstok_token')

  const isAuthenticated = computed(() => !!(token.value || tokenSessao.value))

  async function login(usuario: string, senha: string, unidade: string, manterConectado: boolean) {
    const data = await api.post<{ token: string; user: User }>('/auth/login', {
      email: usuario,
      password: senha,
      unidade,
    })

    if (manterConectado) {
      token.value = data.token
    } else {
      tokenSessao.value = data.token
    }
    user.value = data.user

    await navigateTo('/dashboard')
  }

  async function logout() {
    await api.post('/auth/logout', {}).catch(() => {})
    token.value = null
    tokenSessao.value = null
    user.value = null
    await navigateTo('/login')
  }

  async function fetchUser() {
    if (!isAuthenticated.value) return
    user.value = await api.get<User>('/auth/me')
  }

  return { user, token, isAuthenticated, login, logout, fetchUser }
})
