export function useApi() {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('tokstok_token')

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }

    const enviouToken = !!token.value

    let response: Response
    try {
      response = await fetch(`${config.public.apiBase}${path}`, {
        ...options,
        headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) },
      })
    } catch {
      throw new Error('Não foi possível conectar ao servidor. Tente novamente em instantes.')
    }

    // 401 com token = sessão expirada. Sem token (ex.: login), é só credencial inválida.
    if (response.status === 401 && enviouToken) {
      token.value = null
      await navigateTo('/login')
      throw new Error('Sua sessão expirou. Entre novamente.')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro inesperado' }))
      throw new Error(error.message ?? 'Erro de validação. Verifique os dados.')
    }

    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  }
}
