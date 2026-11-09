// Monta "?a=1&b=2" ignorando filtros vazios, para não poluir a URL da API.
export function montarQuery(filtros: object) {
  const params = new URLSearchParams()
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') params.set(chave, String(valor))
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}
