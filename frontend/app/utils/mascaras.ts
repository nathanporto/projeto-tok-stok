export type TipoMascara = 'cnpj' | 'telefone'

// CNPJ: 12 posições alfanuméricas (CNPJ alfanumérico, Receita Federal, jul/2026) + 2 dígitos verificadores.
function mascaraCnpj(valor: string) {
  const bruto = valor.toUpperCase().replace(/[^0-9A-Z]/g, '')
  let base = ''
  let dv = ''
  for (const c of bruto) {
    if (base.length < 12) base += c
    else if (dv.length < 2 && /\d/.test(c)) dv += c
  }
  const s = base + dv
  let out = s.slice(0, 2)
  if (s.length > 2) out += '.' + s.slice(2, 5)
  if (s.length > 5) out += '.' + s.slice(5, 8)
  if (s.length > 8) out += '/' + s.slice(8, 12)
  if (s.length > 12) out += '-' + s.slice(12, 14)
  return out
}

// Telefone fixo (00) 0000-0000 ou celular (00) 00000-0000.
function mascaraTelefone(valor: string) {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  if (!d) return ''
  if (d.length <= 2) return `(${d}`
  const corte = d.length === 11 ? 7 : 6
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, corte)}-${d.slice(corte)}`
}

export function aplicarMascara(tipo: TipoMascara, valor: string) {
  return tipo === 'cnpj' ? mascaraCnpj(valor) : mascaraTelefone(valor)
}

// Para exibição: formata o que já está salvo (inclusive cadastros antigos sem pontuação).
export function formatarCnpj(valor: string | null | undefined) {
  return valor ? mascaraCnpj(valor) : '—'
}

export function formatarTelefone(valor: string | null | undefined) {
  return valor ? mascaraTelefone(valor) : '—'
}
