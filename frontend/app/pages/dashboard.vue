<script setup lang="ts">
import { useDashboardStore } from '~/stores/dashboard'

const store = useDashboardStore()
const feedback = useFeedback()

onMounted(() => {
  store.fetch().catch(feedback.erro)
})

const resumo = computed(() => store.resumo)

function tagMovimento(tipo: 'entrada' | 'saida') {
  return tipo === 'entrada' ? 'tag-accent' : 'tag-outline'
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

  <AlertBar v-if="feedback.mensagem.value" :tipo="feedback.tipo.value" :mensagem="feedback.mensagem.value" @fechar="feedback.limpar" />

  <section class="kpis">
    <KpiCard kicker="Produtos cadastrados" :valor="resumo?.total_produtos ?? '—'" nota="Itens ativos no sistema" />
    <KpiCard kicker="Estoque baixo" :valor="resumo?.estoque_baixo ?? '—'" nota="Abaixo do estoque mínimo" />
    <KpiCard kicker="Sem estoque" :valor="resumo?.sem_estoque ?? '—'" nota="Saldo zerado" />
    <KpiCard kicker="Total de entradas" :valor="resumo?.total_entradas ?? '—'" nota="Movimentações de entrada" />
    <KpiCard kicker="Total de saídas" :valor="resumo?.total_saidas ?? '—'" nota="Movimentações de saída" />
  </section>

  <div class="dash-split">
    <section class="block">
      <div class="block-head">
        <h6>Alerta de estoque mínimo</h6>
        <span class="block-head__meta">{{ resumo?.alertas.length ?? 0 }} item(ns) para reposição</span>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th style="width:80px">Cód.</th>
            <th>Produto</th>
            <th style="width:120px">Categoria</th>
            <th style="width:70px;text-align:right">Saldo</th>
            <th style="width:70px;text-align:right">Mínimo</th>
            <th style="width:110px">Situação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in resumo?.alertas ?? []" :key="p.id">
            <td class="muted">{{ p.codigo }}</td>
            <td class="strong">{{ p.nome }}</td>
            <td class="small muted">{{ p.categoria?.nome ?? '—' }}</td>
            <td class="num">{{ p.quantidade }}</td>
            <td class="num muted">{{ p.estoque_minimo }}</td>
            <td><span class="tag" :class="situacaoEstoque(p.quantidade, p.estoque_minimo).tagClasse">{{ situacaoEstoque(p.quantidade, p.estoque_minimo).situacao }}</span></td>
          </tr>
        </tbody>
      </table>
      <p v-if="resumo && resumo.alertas.length === 0" class="empty">Nenhum produto abaixo do estoque mínimo.</p>
    </section>

    <section class="block">
      <div class="block-head">
        <h6>Últimas movimentações</h6>
        <span class="block-head__meta">Entrada / Saída</span>
      </div>
      <div class="mov-list">
        <div v-for="m in resumo?.ultimas_movimentacoes ?? []" :key="m.id" class="mov-row">
          <span class="mov-row__data">{{ formatarData(m.data) }}</span>
          <span>
            <span class="strong">{{ m.produto?.nome }}</span>
            <span class="mov-row__resp">{{ m.tipo === 'entrada' ? (m.fornecedor?.nome ?? 'Fornecedor não informado') : (m.motivo ?? 'Motivo não informado') }}</span>
          </span>
          <span class="mov-row__right">
            <span class="tag" :class="tagMovimento(m.tipo)">{{ m.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA' }}</span>
            <span class="mov-row__delta">{{ m.tipo === 'entrada' ? '+' : '−' }}{{ m.quantidade }}</span>
          </span>
        </div>
      </div>
      <p v-if="resumo && resumo.ultimas_movimentacoes.length === 0" class="empty">Nenhuma movimentação registrada ainda.</p>
    </section>
  </div>
</template>

<style scoped>
.kpis { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--space-6); }
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
.empty {
  margin: 0; padding: var(--space-6); text-align: center; font-size: 13px;
  color: color-mix(in srgb, var(--color-text) 55%, transparent); border: 1px dashed var(--color-divider);
}

.mov-list { display: flex; flex-direction: column; }
.mov-row {
  display: grid; grid-template-columns: 78px 1fr auto; align-items: center; gap: var(--space-3);
  padding: var(--space-3) 0; border-bottom: 1px solid color-mix(in srgb, var(--color-text) 8%, transparent);
}
.mov-row__data { font-size: 11px; letter-spacing: 0.06em; opacity: 0.55; font-variant-numeric: tabular-nums; }
.mov-row__resp { display: block; font-size: 11px; opacity: 0.6; }
.mov-row__right { display: flex; align-items: center; gap: var(--space-3); }
.mov-row__delta { font-family: var(--font-heading); font-size: 18px; min-width: 52px; text-align: right; font-variant-numeric: tabular-nums; }

@media (max-width: 1300px) {
  .kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 1100px) {
  .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dash-split { grid-template-columns: 1fr; }
}
</style>
