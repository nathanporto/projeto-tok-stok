<script setup lang="ts">
import { useEstoqueMock } from '~/composables/useEstoqueMock'

const { movimentacoes } = useEstoqueMock()

const busca = ref('')
const tipoFiltro = ref<'TODOS' | 'ENTRADA' | 'SAÍDA'>('TODOS')

const filtradas = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return movimentacoes.value.filter((m) => {
    if (tipoFiltro.value !== 'TODOS' && m.tipo !== tipoFiltro.value) return false
    if (!termo) return true
    return [m.produto, m.responsavelOuMotivo, m.documento].join(' ').toLowerCase().includes(termo)
  })
})

const totalEntradas = computed(() => filtradas.value.filter(m => m.tipo === 'ENTRADA').reduce((a, m) => a + m.quantidade, 0))
const totalSaidas = computed(() => filtradas.value.filter(m => m.tipo === 'SAÍDA').reduce((a, m) => a + m.quantidade, 0))

function tagMovimento(t: 'ENTRADA' | 'SAÍDA') {
  return t === 'ENTRADA' ? 'tag-accent' : 'tag-outline'
}

function limpar() {
  busca.value = ''
  tipoFiltro.value = 'TODOS'
}
</script>

<template>
  <PageHeader
    kicker="Histórico"
    title="Histórico de movimentações"
    subtitle="Todas as entradas e saídas registradas no estoque, com filtros por tipo e período."
  >
    <template #actions>
      <button type="button" class="btn btn-secondary" @click="limpar">Limpar filtros</button>
    </template>
  </PageHeader>

  <section class="kpis">
    <KpiCard kicker="Movimentações filtradas" :valor="filtradas.length" nota="Registros no período selecionado" />
    <KpiCard kicker="Total de entradas" :valor="`+${totalEntradas}`" nota="Unidades recebidas" />
    <KpiCard kicker="Total de saídas" :valor="`−${totalSaidas}`" nota="Unidades expedidas" />
  </section>

  <section class="block">
    <div class="block-head">
      <h6>Registros</h6>
      <div class="seg">
        <label class="seg-opt"><input v-model="tipoFiltro" type="radio" name="tipoFiltro" value="TODOS">Todos</label>
        <label class="seg-opt"><input v-model="tipoFiltro" type="radio" name="tipoFiltro" value="ENTRADA">Entradas</label>
        <label class="seg-opt"><input v-model="tipoFiltro" type="radio" name="tipoFiltro" value="SAÍDA">Saídas</label>
      </div>
      <input v-model="busca" class="input search" type="search" placeholder="Buscar por produto, responsável ou documento…">
    </div>

    <table class="table">
      <thead>
        <tr>
          <th style="width:64px">ID</th>
          <th style="width:80px">Data</th>
          <th style="width:96px">Tipo</th>
          <th>Produto</th>
          <th style="width:170px">Resp. / Motivo</th>
          <th style="width:110px">Documento</th>
          <th style="width:74px;text-align:right">Qtd</th>
          <th style="width:90px;text-align:right">Saldo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in filtradas" :key="m.id">
          <td class="num muted">{{ m.id }}</td>
          <td class="num muted">{{ m.data }}</td>
          <td><span class="tag" :class="tagMovimento(m.tipo)">{{ m.tipo }}</span></td>
          <td class="strong">{{ m.produto }}</td>
          <td class="small">{{ m.responsavelOuMotivo }}</td>
          <td class="small muted">{{ m.documento }}</td>
          <td class="num">{{ m.tipo === 'ENTRADA' ? '+' : '−' }}{{ m.quantidade }}</td>
          <td class="num strong">{{ m.saldo }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="filtradas.length === 0" class="empty">Nenhuma movimentação encontrada para o filtro atual.</p>
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
.search { width: 300px; max-width: 100%; }

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
}
</style>
