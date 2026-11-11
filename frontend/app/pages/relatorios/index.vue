<script setup lang="ts">
import { useProdutosStore } from '~/stores/produtos'
import { useRelatoriosStore, type RelatorioFiltros } from '~/stores/relatorios'

const store = useRelatoriosStore()
const produtosStore = useProdutosStore()
const feedback = useFeedback()

// Período padrão: do primeiro dia do mês atual até hoje.
const hoje = new Date()
const filtros = reactive<Required<RelatorioFiltros>>({
  produto_id: null,
  data_inicio: dataLocalISO(new Date(hoje.getFullYear(), hoje.getMonth(), 1)),
  data_fim: dataLocalISO(hoje),
})

function carregar() {
  if (filtros.data_inicio && filtros.data_fim && filtros.data_fim < filtros.data_inicio) {
    feedback.erro(new Error('A data final deve ser igual ou posterior à data inicial.'))
    return
  }
  feedback.limpar()
  store.fetch(filtros).catch(feedback.erro)
}

watch(() => [filtros.produto_id, filtros.data_inicio, filtros.data_fim], carregar)

onMounted(() => {
  carregar()
  produtosStore.fetchAll().catch(feedback.erro)
})

const r = computed(() => store.relatorio)
</script>

<template>
  <PageHeader
    kicker="Relatórios"
    title="Relatórios de estoque"
    subtitle="Estoque atual, entradas, saídas e produtos com estoque baixo — filtrando por produto e período."
  />

  <AlertBar v-if="feedback.mensagem.value" :tipo="feedback.tipo.value" :mensagem="feedback.mensagem.value" @fechar="feedback.limpar" />

  <div class="filtros">
    <label class="field">
      <span>Produto</span>
      <select v-model="filtros.produto_id" class="input">
        <option :value="null">Todos os produtos</option>
        <option v-for="p in produtosStore.produtos" :key="p.id" :value="p.id">{{ p.nome }}</option>
      </select>
    </label>
    <label class="field"><span>Período — de</span><input v-model="filtros.data_inicio" class="input" type="date"></label>
    <label class="field"><span>até</span><input v-model="filtros.data_fim" class="input" type="date"></label>
  </div>

  <section class="kpis">
    <KpiCard kicker="Estoque atual" :valor="r ? r.estoque_atual.toLocaleString('pt-BR') : '—'" :nota="r ? `Valor em estoque: ${formatarMoeda(r.valor_em_estoque)}` : 'Unidades em estoque'" />
    <KpiCard kicker="Entradas no período" :valor="r ? `+${r.total_entradas}` : '—'" nota="Unidades recebidas" />
    <KpiCard kicker="Saídas no período" :valor="r ? `−${r.total_saidas}` : '—'" nota="Unidades expedidas" />
    <KpiCard kicker="Estoque baixo" :valor="r ? r.produtos_baixo.length : '—'" nota="Produtos abaixo do mínimo" />
  </section>

  <section class="block">
    <div class="block-head"><h6>Estoque atual por produto</h6></div>
    <div class="table-scroll">
      <table class="table">
        <thead>
          <tr>
            <th style="width:90px">Cód.</th>
            <th>Produto</th>
            <th style="width:130px">Categoria</th>
            <th style="width:74px;text-align:right">Saldo</th>
            <th style="width:70px;text-align:right">Mín.</th>
            <th style="width:70px;text-align:right">Máx.</th>
            <th style="width:110px;text-align:right">Valor</th>
            <th style="width:110px">Situação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in r?.produtos ?? []" :key="p.id">
            <td class="muted">{{ p.codigo }}</td>
            <td class="strong">{{ p.nome }}</td>
            <td class="small muted">{{ p.categoria?.nome ?? '—' }}</td>
            <td class="num">{{ p.quantidade }}</td>
            <td class="num muted">{{ p.estoque_minimo }}</td>
            <td class="num muted">{{ p.estoque_maximo }}</td>
            <td class="num small">{{ formatarMoeda(p.quantidade * Number(p.preco_custo)) }}</td>
            <td><span class="tag" :class="situacaoEstoque(p.quantidade, p.estoque_minimo).tagClasse">{{ situacaoEstoque(p.quantidade, p.estoque_minimo).situacao }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="r && r.produtos.length === 0" class="empty">Nenhum produto cadastrado.</p>
  </section>

  <section class="block">
    <div class="block-head">
      <h6>Produtos com estoque baixo</h6>
      <span class="block-head__meta">{{ r?.produtos_baixo.length ?? 0 }} item(ns) para reposição</span>
    </div>
    <div class="table-scroll" v-if="r && r.produtos_baixo.length">
      <table class="table">
        <thead>
          <tr>
            <th>Produto</th>
            <th style="width:74px;text-align:right">Saldo</th>
            <th style="width:70px;text-align:right">Mín.</th>
            <th style="width:120px;text-align:right">Repor (até máx.)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in r.produtos_baixo" :key="p.id">
            <td class="strong">{{ p.nome }}</td>
            <td class="num">{{ p.quantidade }}</td>
            <td class="num muted">{{ p.estoque_minimo }}</td>
            <td class="num strong">{{ Math.max(p.estoque_maximo - p.quantidade, 0) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="r" class="empty">Nenhum produto abaixo do estoque mínimo.</p>
  </section>

  <section class="block">
    <div class="block-head">
      <h6>Movimentações no período</h6>
      <span class="block-head__meta">{{ r?.movimentacoes.length ?? 0 }} registro(s)</span>
    </div>
    <div class="table-scroll" v-if="r && r.movimentacoes.length">
      <table class="table">
        <thead>
          <tr>
            <th style="width:92px">Data</th>
            <th style="width:90px">Tipo</th>
            <th>Produto</th>
            <th style="width:180px">Fornecedor / Motivo</th>
            <th style="width:70px;text-align:right">Qtd</th>
            <th style="width:76px;text-align:right">Saldo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in r.movimentacoes" :key="m.id">
            <td class="num muted">{{ formatarData(m.data) }}</td>
            <td><span class="tag" :class="classeTipo(m.tipo)">{{ rotuloTipo(m.tipo) }}</span></td>
            <td class="strong">{{ m.produto?.nome }}</td>
            <td class="small">{{ origemMovimentacao(m) }}</td>
            <td class="num">{{ m.tipo === 'entrada' ? '+' : '−' }}{{ m.quantidade }}</td>
            <td class="num strong">{{ m.saldo_resultante }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="r" class="empty">Nenhuma movimentação no período selecionado.</p>
  </section>
</template>

<style scoped>
.filtros { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: var(--space-4); align-items: end; }
.kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-6); }
.block { display: flex; flex-direction: column; gap: var(--space-4); }
.block-head {
  display: flex; align-items: center; gap: var(--space-3);
  border-bottom: 1px solid var(--color-divider); padding-bottom: var(--space-3);
}
.block-head h6 { margin: 0; margin-right: auto; }
.block-head__meta { font-size: 11px; color: color-mix(in srgb, var(--color-text) 55%, transparent); }

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
  .filtros { grid-template-columns: 1fr 1fr; }
  .filtros > :first-child { grid-column: 1 / -1; }
}
@media (max-width: 700px) {
  .kpis { gap: var(--space-4); }
}
</style>
