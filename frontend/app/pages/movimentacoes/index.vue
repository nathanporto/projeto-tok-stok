<script setup lang="ts">
import { useEstoqueMock } from '~/composables/useEstoqueMock'

const { produtos, movimentacoes } = useEstoqueMock()

const busca = ref('')
const filtradas = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  if (!termo) return movimentacoes.value
  return movimentacoes.value.filter(m => [m.produto, m.responsavelOuMotivo, m.documento].join(' ').toLowerCase().includes(termo))
})

const tipo = ref<'ENTRADA' | 'SAÍDA'>('ENTRADA')
const produtoId = ref<number | null>(produtos.value[0]?.id ?? null)
const quantidade = ref('')
const responsavel = ref('')
const documento = ref('')
const erro = ref('')

const produtoSelecionado = computed(() => produtos.value.find(p => p.id === produtoId.value) ?? null)

function tagMovimento(t: 'ENTRADA' | 'SAÍDA') {
  return t === 'ENTRADA' ? 'tag-accent' : 'tag-outline'
}

function registrar() {
  erro.value = ''
  const produto = produtoSelecionado.value
  const qtd = parseInt(quantidade.value, 10)

  if (!produto) { erro.value = 'Selecione um produto.'; return }
  if (!qtd || qtd < 1) { erro.value = 'Informe uma quantidade válida.'; return }
  if (tipo.value === 'SAÍDA' && qtd > produto.qtd) {
    erro.value = `Saída de ${qtd} un. bloqueada: saldo disponível de ${produto.qtd} un.`
    return
  }

  const saldo = tipo.value === 'ENTRADA' ? produto.qtd + qtd : produto.qtd - qtd
  produto.qtd = saldo

  const id = Math.max(0, ...movimentacoes.value.map(m => m.id)) + 1
  movimentacoes.value.unshift({
    id,
    data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    tipo: tipo.value,
    produto: produto.nome,
    quantidade: qtd,
    responsavelOuMotivo: responsavel.value.trim() || (tipo.value === 'ENTRADA' ? 'Não informado' : 'Não informado'),
    documento: documento.value.trim() || '—',
    saldo,
  })

  quantidade.value = ''
  responsavel.value = ''
  documento.value = ''
}
</script>

<template>
  <PageHeader
    kicker="Movimentação"
    title="Entradas e saídas"
    subtitle="Registro de entrada e saída de mercadorias com atualização automática do saldo."
  />

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
            <input v-model="tipo" type="radio" name="tipoMov" value="ENTRADA">
            Entrada
          </label>
          <label class="seg-opt seg-opt-full">
            <input v-model="tipo" type="radio" name="tipoMov" value="SAÍDA">
            Saída
          </label>
        </div>
      </div>

      <label class="field">
        <span>Produto</span>
        <select v-model="produtoId" class="input">
          <option v-for="p in produtos" :key="p.id" :value="p.id">{{ p.codigo }} · {{ p.nome }} ({{ p.qtd }} un.)</option>
        </select>
      </label>

      <label class="field"><span>Quantidade</span><input v-model="quantidade" class="input" type="number" min="1"></label>
      <label class="field"><span>{{ tipo === 'ENTRADA' ? 'Fornecedor' : 'Motivo / responsável' }}</span><input v-model="responsavel" class="input" :placeholder="tipo === 'ENTRADA' ? 'Nome do fornecedor' : 'Consumo, avaria, etc.'"></label>
      <label class="field"><span>Documento</span><input v-model="documento" class="input" placeholder="NF 000.000 / OP 000"></label>

      <div class="card-meta">
        Saldo disponível: {{ produtoSelecionado ? `${produtoSelecionado.qtd} un. — ${produtoSelecionado.nome}` : 'selecione um produto' }}
      </div>

      <div v-if="erro" class="alerta">
        <span class="alerta-tag">Bloqueado</span>
        <span>{{ erro }}</span>
      </div>

      <button type="submit" class="btn btn-primary btn-block">Registrar movimentação</button>
    </form>

    <section class="block">
      <div class="block-head">
        <h6>Livro de movimentações</h6>
        <input v-model="busca" class="input search" type="search" placeholder="Filtrar por produto ou responsável…">
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
    </section>
  </div>
</template>

<style scoped>
.split { display: grid; grid-template-columns: 340px 1fr; gap: var(--space-8); align-items: start; }
.form { padding: var(--space-6); gap: var(--space-4); }
.form-title { margin: 2px 0 0; font-size: 22px; text-transform: uppercase; }
.seg-full { width: 100%; }
.seg-opt-full { flex: 1; justify-content: center; }

.block { display: flex; flex-direction: column; gap: var(--space-4); }
.block-head {
  display: flex; align-items: center; gap: var(--space-3);
  border-bottom: 1px solid var(--color-divider); padding-bottom: var(--space-3);
}
.block-head h6 { margin: 0; margin-right: auto; }
.search { width: 280px; max-width: 100%; }

.num { text-align: right; font-variant-numeric: tabular-nums; }
.muted { color: color-mix(in srgb, var(--color-text) 55%, transparent); }
.small { font-size: 13px; }
.strong { font-family: var(--font-heading); font-size: 16px; }

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
  .split { grid-template-columns: 1fr; }
}
</style>
