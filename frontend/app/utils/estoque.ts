export function situacaoEstoque(quantidade: number, minimo: number) {
  if (quantidade === 0) return { situacao: 'Sem estoque', tagClasse: 'tag-neutral' } as const
  if (quantidade < minimo) return { situacao: 'Abaixo do mín.', tagClasse: 'tag-outline' } as const
  return { situacao: 'Regular', tagClasse: 'tag-accent' } as const
}

export function formatarMoeda(valor: string | number) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatarData(data: string) {
  const [ano, mes, dia] = data.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

// toISOString() devolve a data em UTC — à noite no Brasil isso já seria "amanhã".
export function dataLocalISO(data = new Date()) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function rotuloTipo(tipo: 'entrada' | 'saida') {
  return tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA'
}

export function classeTipo(tipo: 'entrada' | 'saida') {
  return tipo === 'entrada' ? 'tag-accent' : 'tag-outline'
}

// Para entradas mostramos o fornecedor; para saídas, o motivo.
export function origemMovimentacao(m: { tipo: 'entrada' | 'saida'; motivo: string | null; fornecedor?: { nome: string } | null }) {
  return m.tipo === 'entrada'
    ? (m.fornecedor?.nome ?? 'Fornecedor não informado')
    : (m.motivo ?? 'Motivo não informado')
}
