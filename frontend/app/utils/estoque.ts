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
