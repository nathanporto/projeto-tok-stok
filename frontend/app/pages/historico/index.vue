<script setup lang="ts">
import { useMovimentacoesStore } from '~/stores/movimentacoes'
import { useProdutosStore } from '~/stores/produtos'
import type { MovimentacaoFiltros } from '~/types'

const store = useMovimentacoesStore()
const produtosStore = useProdutosStore()
const feedback = useFeedback()

const filtros = reactive<Required<MovimentacaoFiltros>>({
  tipo: '',
  produto_id: null,
  data_inicio: '',
  data_fim: '',
  busca: '',
})

function carregar() {
  if (filtros.data_inicio && filtros.data_fim && filtros.data_fim < filtros.data_inicio) {
    feedback.erro(new Error('A data final deve ser igual ou posterior à data inicial.'))
    return
  }
  store.fetchAll({ ...filtros, busca: filtros.busca.trim() }).catch(feedback.erro)
}

let timer: ReturnType<typeof setTimeout> | undefined
watch(() => filtros.busca, () => {
  clearTimeout(timer)
  timer = setTimeout(carregar, 300)
})
watch(() => [filtros.tipo, filtros.produto_id, filtros.data_inicio, filtros.data_fim], carregar)

onMounted(() => {
  carregar()
  produtosStore.fetchAll().catch(feedback.erro)
})

const totalEntradas = computed(() => store.movimentacoes.filter(m => m.tipo === 'entrada').reduce((a, m) => a + m.quantidade, 0))
const totalSaidas = computed(() => store.movimentacoes.filter(m => m.tipo === 'saida').reduce((a, m) => a + m.quantidade, 0))

function limpar() {
  filtros.tipo = ''
  filtros.produto_id = null
  filtros.data_inicio = ''
  filtros.data_fim = ''
  filtros.busca = ''
  feedback.limpar()
}
</script>

<template>
  <PageHeader
    kicker="Histórico"
    title="Histórico de movimentações"
    subtitle="Todas as entradas e saídas registradas no estoque, com filtros por tipo, produto e período."
  >
    <template #actions>
      <button type="button" class="btn btn-secondary" @click="limpar">Limpar filtros</button>
    </template>
  </PageHeader>

  <AlertBar v-if="feedback.mensagem.value" :tipo="feedback.tipo.value" :mensagem="feedback.mensagem.value" @fechar="feedback.limpar" />

  <section class="kpis">
    <KpiCard kicker="Movimentações filtradas" :valor="store.movimentacoes.length" nota="Registros encontrados" />
    <KpiCard kicker="Unidades que entraram" :valor="`+${totalEntradas}`" nota="Soma das entradas filtradas" />
    <KpiCard kicker="Unidades que saíram" :valor="`−${totalSaidas}`" nota="Soma das saídas filtradas" />
  </section>

  <section class="block">
    <div class="block-head">
      <h6>Registros</h6>
      <div class="seg">
        <label class="seg-opt"><input v-model="filtros.tipo" type="radio" name="tipoFiltro" value="">Todos</label>
        <label class="seg-opt"><input v-model="filtros.tipo" type="radio" name="tipoFiltro" value="entrada">Entradas</label>
        <label class="seg-opt"><input v-model="filtros.tipo" type="radio" name="tipoFiltro" value="saida">Saídas</label>
      </div>
    </div>

    <div class="filtros">
      <input v-model="filtros.busca" class="input" type="search" placeholder="Buscar por produto, motivo ou fornecedor…">
      <select v-model="filtros.produto_id" class="input">
        <option :value="null">Todos os produtos</option>
        <option v-for="p in produtosStore.produtos" :key="p.id" :value="p.id">{{ p.nome }}</option>
      </select>
      <label class="field"><span>De</span><input v-model="filtros.data_inicio" class="input" type="date"></label>
      <label class="field"><span>Até</span><input v-model="filtros.data_fim" class="input" type="date"></label>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th style="width:56px">ID</th>
          <th style="width:92px">Data</th>
          <th style="width:90px">Tipo</th>
          <th>Produto</th>
          <th style="width:180px">Fornecedor / Motivo</th>
          <th style="width:150px">Observação</th>
          <th style="width:130px">Operador</th>
          <th style="width:70px;text-align:right">Qtd</th>
          <th style="width:76px;text-align:right">Saldo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in store.movimentacoes" :key="m.id">
          <td class="num muted">{{ m.id }}</td>
          <td class="num muted">{{ formatarData(m.data) }}</td>
          <td><span class="tag" :class="classeTipo(m.tipo)">{{ rotuloTipo(m.tipo) }}</span></td>
          <td class="strong">{{ m.produto?.nome }}</td>
          <td class="small">{{ origemMovimentacao(m) }}</td>
          <td class="small muted">{{ m.observacao || '—' }}</td>
          <td class="small muted">{{ m.user?.name ?? '—' }}</td>
          <td class="num">{{ m.tipo === 'entrada' ? '+' : '−' }}{{ m.quantidade }}</td>
          <td class="num strong">{{ m.saldo_resultante }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="!store.carregando && store.movimentacoes.length === 0" class="empty">Nenhuma movimentação encontrada para o filtro atual.</p>
  </section>
</template>

<style scoped>
.kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-6); }
.block { display: flex; flex-direction: column; gap: var(--space-4); }
.block-head {
  display: flex; align-items: center; gap: var(--space-3);
  border-bottom: 1px solid var(--color-divider); padding-bottom: var(--space-3); flex-wrap: wrap;
}
.block-head h6 { margin: 0; margin-right: auto; }
.filtros { display: grid; grid-template-columns: 2fr 1.4fr 1fr 1fr; gap: var(--space-3); align-items: end; }

.num { text-align: right; font-variant-numeric: tabular-nums; }
.muted { color: color-mix(in srgb, var(--color-text) 55%, transparent); }
.small { font-size: 13px; }
.strong { font-family: var(--font-heading); font-size: 16px; }
.empty {
  margin: 0; padding: var(--space-6); text-align: center; font-size: 13px;
  color: color-mix(in srgb, var(--color-text) 55%, transparent); border: 1px dashed var(--color-divider);
}

@media (max-width: 1100px) {
  .kpis { grid-template-columns: 1fr; }
  .filtros { grid-template-columns: 1fr 1fr; }
}
</style>
