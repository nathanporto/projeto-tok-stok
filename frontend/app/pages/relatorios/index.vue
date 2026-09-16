<script setup lang="ts">
import { situacaoProduto, useEstoqueMock } from '~/composables/useEstoqueMock'

const { produtos, movimentacoes } = useEstoqueMock()

const produtoFiltro = ref<number | 'TODOS'>('TODOS')

const movimentacoesFiltradas = computed(() => {
  if (produtoFiltro.value === 'TODOS') return movimentacoes.value
  const nome = produtos.value.find(p => p.id === produtoFiltro.value)?.nome
  return movimentacoes.value.filter(m => m.produto === nome)
})

const totalEntradas = computed(() => movimentacoesFiltradas.value.filter(m => m.tipo === 'ENTRADA').reduce((a, m) => a + m.quantidade, 0))
const totalSaidas = computed(() => movimentacoesFiltradas.value.filter(m => m.tipo === 'SAÍDA').reduce((a, m) => a + m.quantidade, 0))
const estoqueAtual = computed(() => produtos.value.reduce((a, p) => a + p.qtd, 0))
const abaixoDoMinimo = computed(() => produtos.value.filter(p => p.qtd < p.minimo))

function situacao(p: { qtd: number; minimo: number }) {
  return situacaoProduto(p)
}
</script>

<template>
  <PageHeader
    kicker="Relatórios"
    title="Relatórios de estoque"
    subtitle="Estoque atual, entradas, saídas e produtos com estoque baixo — filtrando por produto."
  >
    <template #actions>
      <select v-model="produtoFiltro" class="input filtro-produto">
        <option value="TODOS">Todos os produtos</option>
        <option v-for="p in produtos" :key="p.id" :value="p.id">{{ p.nome }}</option>
      </select>
    </template>
  </PageHeader>

  <section class="kpis">
    <KpiCard kicker="Estoque atual (total)" :valor="estoqueAtual.toLocaleString('pt-BR')" nota="Somatório de todos os saldos" />
    <KpiCard kicker="Entradas no período" :valor="`+${totalEntradas}`" nota="Unidades recebidas" />
    <KpiCard kicker="Saídas no período" :valor="`−${totalSaidas}`" nota="Unidades expedidas" />
    <KpiCard kicker="Abaixo do mínimo" :valor="abaixoDoMinimo.length" nota="Produtos que requerem reposição" />
  </section>

  <section class="block">
    <div class="block-head">
      <h6>Estoque atual por produto</h6>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Produto</th>
          <th style="width:120px">Categoria</th>
          <th style="width:74px;text-align:right">Saldo</th>
          <th style="width:70px;text-align:right">Mín.</th>
          <th style="width:70px;text-align:right">Máx.</th>
          <th style="width:110px">Situação</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in produtos" :key="p.id">
          <td class="strong">{{ p.nome }}</td>
          <td class="small muted">{{ p.categoria }}</td>
          <td class="num">{{ p.qtd }}</td>
          <td class="num muted">{{ p.minimo }}</td>
          <td class="num muted">{{ p.maximo }}</td>
          <td><span class="tag" :class="situacao(p).tagClasse">{{ situacao(p).situacao }}</span></td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="block">
    <div class="block-head">
      <h6>Movimentações no período</h6>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th style="width:80px">Data</th>
          <th style="width:96px">Tipo</th>
          <th>Produto</th>
          <th style="width:74px;text-align:right">Qtd</th>
          <th style="width:90px;text-align:right">Saldo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in movimentacoesFiltradas" :key="m.id">
          <td class="num muted">{{ m.data }}</td>
          <td><span class="tag" :class="m.tipo === 'ENTRADA' ? 'tag-accent' : 'tag-outline'">{{ m.tipo }}</span></td>
          <td class="strong">{{ m.produto }}</td>
          <td class="num">{{ m.tipo === 'ENTRADA' ? '+' : '−' }}{{ m.quantidade }}</td>
          <td class="num strong">{{ m.saldo }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="movimentacoesFiltradas.length === 0" class="empty">Nenhuma movimentação para o produto selecionado.</p>
  </section>
</template>

<style scoped>
.kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-6); }
.filtro-produto { width: 260px; max-width: 100%; }
.block { display: flex; flex-direction: column; gap: var(--space-4); }
.block-head {
  display: flex; align-items: center; gap: var(--space-3);
  border-bottom: 1px solid var(--color-divider); padding-bottom: var(--space-3);
}
.block-head h6 { margin: 0; margin-right: auto; }

.num { text-align: right; font-variant-numeric: tabular-nums; }
.muted { color: color-mix(in srgb, var(--color-text) 55%, transparent); }
.small { font-size: 13px; }
.strong { font-family: var(--font-heading); font-size: 16px; }
.empty {
  margin: 0; padding: var(--space-6); text-align: center; font-size: 13px;
  color: color-mix(in srgb, var(--color-text) 55%, transparent); border: 1px dashed var(--color-divider);
}

@media (max-width: 1100px) {
  .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
