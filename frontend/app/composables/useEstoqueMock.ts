import type { Categoria, Fornecedor, Movimentacao, Produto } from '~/types'

const PRODUTOS: Produto[] = [
  { id: 1, codigo: 'PRD-101', nome: 'Rolamento 6204 ZZ', categoria: 'Componentes', local: 'Galpão A · P3', qtd: 480, minimo: 120, maximo: 800, precoCusto: 4.9, fornecedor: 'Rolamentos Guarulhos Ltda.' },
  { id: 2, codigo: 'PRD-102', nome: 'Chapa de aço 2mm', categoria: 'Matéria-prima', local: 'Galpão B · Pátio', qtd: 62, minimo: 80, maximo: 400, precoCusto: 58.0, fornecedor: 'Aços Andrade S.A.' },
  { id: 3, codigo: 'PRD-103', nome: 'Parafuso M8 × 40', categoria: 'Fixadores', local: 'Galpão A · P1', qtd: 5240, minimo: 1500, maximo: 8000, precoCusto: 0.18, fornecedor: 'Fixadores União' },
  { id: 4, codigo: 'PRD-104', nome: 'Óleo hidráulico 20L', categoria: 'Insumos', local: 'Galpão C · Q2', qtd: 18, minimo: 24, maximo: 120, precoCusto: 210.0, fornecedor: 'Lubrificantes Guarulhos' },
  { id: 5, codigo: 'PRD-105', nome: 'Correia dentada HTD', categoria: 'Componentes', local: 'Galpão A · P4', qtd: 96, minimo: 40, maximo: 200, precoCusto: 32.5, fornecedor: 'Rolamentos Guarulhos Ltda.' },
  { id: 6, codigo: 'PRD-106', nome: 'Tinta epóxi cinza', categoria: 'Acabamento', local: 'Galpão C · Q1', qtd: 0, minimo: 12, maximo: 60, precoCusto: 89.9, fornecedor: 'Tintas Cruzeiro' },
  { id: 7, codigo: 'PRD-107', nome: 'Perfil de alumínio 40×40', categoria: 'Matéria-prima', local: 'Galpão B · P2', qtd: 310, minimo: 100, maximo: 600, precoCusto: 14.3, fornecedor: 'Aços Andrade S.A.' },
]

const CATEGORIAS: Categoria[] = [
  { id: 1, nome: 'Componentes', descricao: 'Peças mecânicas de montagem', status: 'Ativa' },
  { id: 2, nome: 'Matéria-prima', descricao: 'Insumos brutos para produção', status: 'Ativa' },
  { id: 3, nome: 'Fixadores', descricao: 'Parafusos, porcas e arruelas', status: 'Ativa' },
  { id: 4, nome: 'Insumos', descricao: 'Consumíveis de manutenção', status: 'Ativa' },
  { id: 5, nome: 'Acabamento', descricao: 'Tintas, vernizes e solventes', status: 'Inativa' },
]

const FORNECEDORES: Fornecedor[] = [
  { id: 1, nome: 'Rolamentos Guarulhos Ltda.', cnpj: '12.345.678/0001-90', telefone: '(11) 4321-1000', email: 'vendas@rolgru.com.br' },
  { id: 2, nome: 'Aços Andrade S.A.', cnpj: '23.456.789/0001-11', telefone: '(11) 4321-2000', email: 'comercial@acosandrade.com.br' },
  { id: 3, nome: 'Fixadores União', cnpj: '34.567.890/0001-22', telefone: '(11) 4321-3000', email: 'contato@fixadoresuniao.com.br' },
  { id: 4, nome: 'Lubrificantes Guarulhos', cnpj: '45.678.901/0001-33', telefone: '(11) 4321-4000', email: 'sac@lubgru.com.br' },
  { id: 5, nome: 'Tintas Cruzeiro', cnpj: '56.789.012/0001-44', telefone: '(11) 4321-5000', email: 'vendas@tintascruzeiro.com.br' },
]

const MOVIMENTACOES: Movimentacao[] = [
  { id: 41, data: '01/09', tipo: 'ENTRADA', produto: 'Rolamento 6204 ZZ', quantidade: 120, responsavelOuMotivo: 'Recebimento · NF entrada', documento: 'NF 118.402', saldo: 480 },
  { id: 40, data: '01/09', tipo: 'SAÍDA', produto: 'Parafuso M8 × 40', quantidade: 400, responsavelOuMotivo: 'Consumo · linha 2', documento: 'OP 2291', saldo: 5240 },
  { id: 39, data: '31/08', tipo: 'SAÍDA', produto: 'Óleo hidráulico 20L', quantidade: 6, responsavelOuMotivo: 'Manutenção interna', documento: 'OP 2288', saldo: 18 },
  { id: 38, data: '31/08', tipo: 'ENTRADA', produto: 'Perfil de alumínio 40×40', quantidade: 150, responsavelOuMotivo: 'Recebimento · NF entrada', documento: 'NF 118.377', saldo: 310 },
  { id: 37, data: '30/08', tipo: 'SAÍDA', produto: 'Chapa de aço 2mm', quantidade: 38, responsavelOuMotivo: 'Consumo · linha 1', documento: 'NF 9.114', saldo: 62 },
  { id: 36, data: '30/08', tipo: 'SAÍDA', produto: 'Tinta epóxi cinza', quantidade: 12, responsavelOuMotivo: 'Pintura · linha 2', documento: 'OP 2280', saldo: 0 },
]

export function situacaoProduto(p: Pick<Produto, 'qtd' | 'minimo'>) {
  if (p.qtd === 0) return { situacao: 'Sem estoque', tagClasse: 'tag-neutral' } as const
  if (p.qtd < p.minimo) return { situacao: 'Abaixo do mín.', tagClasse: 'tag-outline' } as const
  return { situacao: 'Regular', tagClasse: 'tag-accent' } as const
}

export function useEstoqueMock() {
  const produtos = useState<Produto[]>('mock-produtos', () => structuredClone(PRODUTOS))
  const categorias = useState<Categoria[]>('mock-categorias', () => structuredClone(CATEGORIAS))
  const fornecedores = useState<Fornecedor[]>('mock-fornecedores', () => structuredClone(FORNECEDORES))
  const movimentacoes = useState<Movimentacao[]>('mock-movimentacoes', () => structuredClone(MOVIMENTACOES))

  return { produtos, categorias, fornecedores, movimentacoes }
}
