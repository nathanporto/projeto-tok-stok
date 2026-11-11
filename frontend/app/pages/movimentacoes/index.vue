<script setup lang="ts">
import { useFornecedoresStore } from '~/stores/fornecedores'
import { useMovimentacoesStore } from '~/stores/movimentacoes'
import { useProdutosStore } from '~/stores/produtos'
import type { TipoMovimentacao } from '~/types'

const store = useMovimentacoesStore()
const produtosStore = useProdutosStore()
const fornecedoresStore = useFornecedoresStore()
const feedback = useFeedback()

const busca = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

function carregarLivro() {
  store.fetchAll({ busca: busca.value.trim() }).catch(feedback.erro)
}

watch(busca, () => {
  clearTimeout(timer)
  timer = setTimeout(carregarLivro, 300)
})

onMounted(async () => {
  carregarLivro()
  fornecedoresStore.fetchAll().catch(feedback.erro)
  try {
    await produtosStore.fetchAll()
    if (!produtoId.value && produtosStore.produtos[0]) produtoId.value = produtosStore.produtos[0].id
  } catch (e) {
    feedback.erro(e)
  }
})

const tipo = ref<TipoMovimentacao>('entrada')
const produtoId = ref<number | null>(null)
const quantidade = ref<number | string>('')
const data = ref(dataLocalISO())
const fornecedorId = ref<number | null>(null)
const motivo = ref('')
const observacao = ref('')
const erroForm = ref('')
const registrando = ref(false)

const produtoSelecionado = computed(() => produtosStore.produtos.find(p => p.id === produtoId.value) ?? null)

async function registrar() {
  erroForm.value = ''
  const produto = produtoSelecionado.value
  const qtd = Number(quantidade.value)

  if (!produto) { erroForm.value = 'Selecione um produto.'; return }
  if (!Number.isInteger(qtd) || qtd < 1) { erroForm.value = 'Informe uma quantidade válida.'; return }
  if (tipo.value === 'saida' && !motivo.value.trim()) { erroForm.value = 'Informe o motivo da saída.'; return }
  // A API também valida; aqui é só para o operador não precisar esperar a resposta.
  if (tipo.value === 'saida' && qtd > produto.quantidade) {
    erroForm.value = `Saída de ${qtd} un. bloqueada: saldo disponível de ${produto.quantidade} un.`
    return
  }

  registrando.value = true
  try {
    const mov = await store.registrar({
      tipo: tipo.value,
      produto_id: produto.id,
      quantidade: qtd,
      data: data.value,
      fornecedor_id: tipo.value === 'entrada' ? fornecedorId.value : null,
      motivo: tipo.value === 'saida' ? motivo.value.trim() : null,
      observacao: observacao.value.trim() || null,
    })
    produto.quantidade = mov.saldo_resultante
    feedback.ok(`${tipo.value === 'entrada' ? 'Entrada' : 'Saída'} de ${qtd} un. registrada. Novo saldo de ${produto.nome}: ${mov.saldo_resultante} un.`)
    quantidade.value = ''
    motivo.value = ''
    observacao.value = ''
    carregarLivro()
  } catch (e) {
    erroForm.value = e instanceof Error ? e.message : 'Erro ao registrar movimentação.'
    produtosStore.fetchAll().catch(() => {})
  } finally {
    registrando.value = false
  }
}
</script>

<template>
  <PageHeader
    kicker="Movimentação"
    title="Entradas e saídas"
    subtitle="Registro de entrada e saída de mercadorias com atualização automática do saldo."
  />

  <AlertBar v-if="feedback.mensagem.value" :tipo="feedback.tipo.value" :mensagem="feedback.mensagem.value" @fechar="feedback.limpar" />

  <div class="split">
    <form class="card blueprint form" @submit.prevent="registrar">
      <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
      <div>
        <div class="card-kicker">Movimentacao.registrar()</div>
        <h3 class="form-title">Lançar movimentação</h3>
      </div>

      <div class="field">
        <span>Tipo de operação</span>
        <div class="seg seg-full">
          <label class="seg-opt seg-opt-full">
            <input v-model="tipo" type="radio" name="tipoMov" value="entrada">
            Entrada
          </label>
          <label class="seg-opt seg-opt-full">
            <input v-model="tipo" type="radio" name="tipoMov" value="saida">
            Saída
          </label>
        </div>
      </div>

      <label class="field">
        <span>Produto</span>
        <select v-model="produtoId" class="input" required>
          <option v-if="produtosStore.produtos.length === 0" :value="null" disabled>Cadastre um produto primeiro</option>
          <option v-for="p in produtosStore.produtos" :key="p.id" :value="p.id">{{ p.codigo }} · {{ p.nome }} ({{ p.quantidade }} un.)</option>
        </select>
      </label>

      <div class="form-row">
        <label class="field"><span>Quantidade</span><input v-model="quantidade" class="input" type="number" min="1" step="1" required></label>
        <label class="field"><span>Data</span><input v-model="data" class="input" type="date" :max="dataLocalISO()" required></label>
      </div>

      <label v-if="tipo === 'entrada'" class="field">
        <span>Fornecedor</span>
        <select v-model="fornecedorId" class="input">
          <option :value="null">Não informado</option>
          <option v-for="f in fornecedoresStore.fornecedores" :key="f.id" :value="f.id">{{ f.nome }}</option>
        </select>
      </label>
      <label v-else class="field">
        <span>Motivo</span>
        <input v-model="motivo" class="input" placeholder="Consumo, venda, avaria, ajuste…" required>
      </label>

      <label class="field"><span>Observação</span><input v-model="observacao" class="input" placeholder="NF 000.000 / OP 000 (opcional)"></label>

      <div class="card-meta">
        Saldo disponível: {{ produtoSelecionado ? `${produtoSelecionado.quantidade} un. — ${produtoSelecionado.nome}` : 'selecione um produto' }}
      </div>

      <div v-if="erroForm" class="alerta">
        <span class="alerta-tag">{{ erroForm.includes('bloqueada') ? 'Bloqueado' : 'Atenção' }}</span>
        <span>{{ erroForm }}</span>
      </div>

      <button type="submit" class="btn btn-primary btn-block" :disabled="registrando || !produtoSelecionado">
        {{ registrando ? 'Registrando...' : 'Registrar movimentação' }}
      </button>
    </form>

    <section class="block">
      <div class="block-head">
        <h6>Livro de movimentações</h6>
        <input v-model="busca" class="input search" type="search" placeholder="Filtrar por produto, motivo ou fornecedor…">
      </div>
      <div class="table-scroll">
        <table class="table">
          <thead>
            <tr>
              <th style="width:56px">ID</th>
              <th style="width:92px">Data</th>
              <th style="width:90px">Tipo</th>
              <th>Produto</th>
              <th style="width:170px">Fornecedor / Motivo</th>
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
              <td class="num">{{ m.tipo === 'entrada' ? '+' : '−' }}{{ m.quantidade }}</td>
              <td class="num strong">{{ m.saldo_resultante }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!store.carregando && store.movimentacoes.length === 0" class="empty">
        {{ busca ? 'Nenhuma movimentação encontrada para o filtro.' : 'Nenhuma movimentação registrada ainda.' }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.split { display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: var(--space-8); align-items: start; }
.form { padding: var(--space-6); gap: var(--space-4); }
.form-title { margin: 2px 0 0; font-size: 22px; text-transform: uppercase; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.seg-full { width: 100%; }
.seg-opt-full { flex: 1; justify-content: center; }

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

.alerta {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-3); border: 1px solid var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 9%, transparent); font-size: 13px;
}
.alerta-tag {
  font-family: var(--font-heading); font-size: 12px; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--color-accent-700);
}

@media (max-width: 1100px) {
  .split { grid-template-columns: minmax(0, 1fr); gap: var(--space-6); }
}
@media (max-width: 700px) {
  .form { padding: var(--space-4); }
}
</style>
