<script setup lang="ts">
import { situacaoProduto, useEstoqueMock } from '~/composables/useEstoqueMock'

const { produtos, movimentacoes } = useEstoqueMock()

const abaixoDoMinimo = computed(() => produtos.value.filter(p => p.qtd > 0 && p.qtd < p.minimo))
const semEstoque = computed(() => produtos.value.filter(p => p.qtd === 0))
const alertas = computed(() => produtos.value.filter(p => p.qtd < p.minimo))

const entradasHoje = computed(() => movimentacoes.value.filter(m => m.tipo === 'ENTRADA' && m.data === '01/09'))
const saidasHoje = computed(() => movimentacoes.value.filter(m => m.tipo === 'SAÍDA' && m.data === '01/09'))

const ultimasMovimentacoes = computed(() => movimentacoes.value.slice(0, 5))

function tagMovimento(tipo: 'ENTRADA' | 'SAÍDA') {
  return tipo === 'ENTRADA' ? 'tag-accent' : 'tag-outline'
}
function delta(m: { tipo: 'ENTRADA' | 'SAÍDA'; quantidade: number }) {
  return (m.tipo === 'ENTRADA' ? '+' : '−') + m.quantidade
}
</script>

<template>
  <PageHeader
    kicker="Visão geral"
    title="Painel de estoque"
    subtitle="Indicadores consolidados, alertas de reposição e as últimas movimentações registradas."
  >
    <template #actions>
      <NuxtLink to="/produtos" class="btn btn-primary blueprint">
        <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
        + Novo produto
      </NuxtLink>
    </template>
  </PageHeader>

  <section class="kpis">
    <KpiCard kicker="Itens cadastrados" :valor="produtos.length" nota="SKUs ativos no sistema" />
    <KpiCard kicker="Abaixo do mínimo" :valor="abaixoDoMinimo.length" nota="Requerem reposição em breve" />
    <KpiCard kicker="Sem estoque" :valor="semEstoque.length" nota="Saldo zerado" />
    <KpiCard kicker="Entradas / Saídas hoje" :valor="`${entradasHoje.length} / ${saidasHoje.length}`" nota="Movimentações de 01/09" />
  </section>

  <div class="dash-split">
    <section class="block">
      <div class="block-head">
        <h6>Alerta de estoque mínimo</h6>
        <span class="block-head__meta">{{ alertas.length }} item(ns) para reposição</span>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th style="width:64px">Cód.</th>
            <th>Produto</th>
            <th style="width:120px">Local</th>
            <th style="width:70px;text-align:right">Saldo</th>
            <th style="width:70px;text-align:right">Mínimo</th>
            <th style="width:110px">Situação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in alertas" :key="p.id">
            <td class="num muted">{{ p.codigo }}</td>
            <td class="strong">{{ p.nome }}</td>
            <td class="small muted">{{ p.local }}</td>
            <td class="num">{{ p.qtd }}</td>
            <td class="num muted">{{ p.minimo }}</td>
            <td><span class="tag" :class="situacaoProduto(p).tagClasse">{{ situacaoProduto(p).situacao }}</span></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="block">
      <div class="block-head">
        <h6>Últimas movimentações</h6>
        <span class="block-head__meta">Entrada / Saída</span>
      </div>
      <div class="mov-list">
        <div v-for="m in ultimasMovimentacoes" :key="m.id" class="mov-row">
          <span class="mov-row__data">{{ m.data }}</span>
          <span>
            <span class="strong">{{ m.produto }}</span>
            <span class="mov-row__resp">{{ m.responsavelOuMotivo }}</span>
          </span>
          <span class="mov-row__right">
            <span class="tag" :class="tagMovimento(m.tipo)">{{ m.tipo }}</span>
            <span class="mov-row__delta">{{ delta(m) }}</span>
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-6); }
.dash-split { display: grid; grid-template-columns: 1.15fr 1fr; gap: var(--space-8); align-items: start; }
.block { display: flex; flex-direction: column; gap: var(--space-4); }
.block-head {
  display: flex; align-items: baseline; gap: var(--space-3);
  border-bottom: 1px solid var(--color-divider); padding-bottom: var(--space-2);
}
.block-head h6 { margin: 0; }
.block-head__meta { margin-left: auto; font-size: 11px; color: color-mix(in srgb, var(--color-text) 55%, transparent); }

.num { text-align: right; font-variant-numeric: tabular-nums; }
.muted { color: color-mix(in srgb, var(--color-text) 55%, transparent); }
.small { font-size: 12px; }
.strong { font-family: var(--font-heading); font-size: 16px; }

.mov-list { display: flex; flex-direction: column; }
.mov-row {
  display: grid; grid-template-columns: 78px 1fr auto; align-items: center; gap: var(--space-3);
  padding: var(--space-3) 0; border-bottom: 1px solid color-mix(in srgb, var(--color-text) 8%, transparent);
}
.mov-row__data { font-size: 11px; letter-spacing: 0.06em; opacity: 0.55; font-variant-numeric: tabular-nums; }
.mov-row__resp { display: block; font-size: 11px; opacity: 0.6; }
.mov-row__right { display: flex; align-items: center; gap: var(--space-3); }
.mov-row__delta { font-family: var(--font-heading); font-size: 18px; min-width: 52px; text-align: right; font-variant-numeric: tabular-nums; }

@media (max-width: 1100px) {
  .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dash-split { grid-template-columns: 1fr; }
}
</style>
