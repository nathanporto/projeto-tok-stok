<script setup lang="ts">
import { situacaoProduto, useEstoqueMock } from '~/composables/useEstoqueMock'
import type { Produto } from '~/types'

const { produtos, categorias, fornecedores } = useEstoqueMock()

const busca = ref('')
const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  if (!termo) return produtos.value
  return produtos.value.filter(p =>
    [p.nome, p.codigo, p.categoria, p.local, p.fornecedor].join(' ').toLowerCase().includes(termo),
  )
})

type FormProduto = Omit<Produto, 'id' | 'qtd' | 'minimo' | 'maximo' | 'precoCusto'> & {
  id: number | null
  qtd: string
  minimo: string
  maximo: string
  precoCusto: string
}

const formAberto = ref(false)
const form = ref<FormProduto>(vazio())

function vazio(): FormProduto {
  return { id: null, nome: '', codigo: '', categoria: '', local: '', fornecedor: '', qtd: '', minimo: '', maximo: '', precoCusto: '' }
}

function novoProduto() {
  form.value = vazio()
  formAberto.value = true
}

function editarProduto(p: Produto) {
  form.value = {
    id: p.id,
    nome: p.nome,
    codigo: p.codigo,
    categoria: p.categoria,
    local: p.local,
    fornecedor: p.fornecedor,
    qtd: String(p.qtd),
    minimo: String(p.minimo),
    maximo: String(p.maximo),
    precoCusto: String(p.precoCusto),
  }
  formAberto.value = true
}

function salvar() {
  if (!form.value.nome.trim()) return

  const qtd = parseInt(form.value.qtd, 10) || 0
  const minimo = parseInt(form.value.minimo, 10) || 0
  const maximo = parseInt(form.value.maximo, 10) || 0
  const precoCusto = parseFloat(form.value.precoCusto) || 0

  if (form.value.id) {
    const idx = produtos.value.findIndex(p => p.id === form.value.id)
    if (idx !== -1) {
      produtos.value[idx] = { ...produtos.value[idx], ...form.value, qtd, minimo, maximo, precoCusto }
    }
  } else {
    const id = Math.max(0, ...produtos.value.map(p => p.id)) + 1
    produtos.value.push({
      id,
      nome: form.value.nome.trim(),
      codigo: form.value.codigo.trim() || `PRD-${100 + id}`,
      categoria: form.value.categoria.trim() || 'Geral',
      local: form.value.local.trim() || 'A definir',
      fornecedor: form.value.fornecedor.trim() || '—',
      qtd, minimo, maximo, precoCusto,
    })
  }

  formAberto.value = false
}

function excluir(p: Produto) {
  produtos.value = produtos.value.filter(x => x.id !== p.id)
}
</script>

<template>
  <PageHeader
    kicker="Produto · CRUD"
    title="Produtos"
    subtitle="Cadastrar, consultar, alterar e excluir itens do estoque industrial."
  >
    <template #actions>
      <button type="button" class="btn btn-secondary" @click="busca = ''">Limpar filtros</button>
      <button type="button" class="btn btn-primary blueprint" @click="novoProduto">
        <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
        + Cadastrar produto
      </button>
    </template>
  </PageHeader>

  <section class="block">
    <div class="block-head">
      <h6>Consultar estoque</h6>
      <input v-model="busca" class="input search" type="search" placeholder="Buscar por nome, código ou categoria…">
      <span class="block-head__meta">{{ filtrados.length }} de {{ produtos.length }} produtos</span>
    </div>

    <form v-if="formAberto" class="card blueprint form" @submit.prevent="salvar">
      <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
      <div class="form-head">
        <h3>{{ form.id ? `Alterar produto #${form.id}` : 'Cadastrar produto' }}</h3>
        <span class="form-hint">Produto.cadastrar() / alterar()</span>
      </div>
      <div class="form-grid">
        <label class="field"><span>Nome do produto</span><input v-model="form.nome" class="input" placeholder="Rolamento 6204 ZZ"></label>
        <label class="field"><span>Código interno</span><input v-model="form.codigo" class="input" placeholder="PRD-000"></label>
        <label class="field">
          <span>Categoria</span>
          <select v-model="form.categoria" class="input">
            <option value="">Selecione…</option>
            <option v-for="c in categorias" :key="c.id" :value="c.nome">{{ c.nome }}</option>
          </select>
        </label>
        <label class="field"><span>Localização</span><input v-model="form.local" class="input" placeholder="Galpão A · Prateleira 3"></label>
        <label class="field">
          <span>Fornecedor</span>
          <select v-model="form.fornecedor" class="input">
            <option value="">Selecione…</option>
            <option v-for="f in fornecedores" :key="f.id" :value="f.nome">{{ f.nome }}</option>
          </select>
        </label>
        <label class="field"><span>Preço/custo (R$)</span><input v-model="form.precoCusto" class="input" type="number" step="0.01" min="0"></label>
        <label class="field"><span>Quantidade em estoque</span><input v-model="form.qtd" class="input" type="number" min="0"></label>
        <label class="field"><span>Estoque mínimo</span><input v-model="form.minimo" class="input" type="number" min="0"></label>
        <label class="field"><span>Estoque máximo</span><input v-model="form.maximo" class="input" type="number" min="0"></label>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="formAberto = false">Cancelar</button>
        <button type="submit" class="btn btn-primary">Salvar produto</button>
      </div>
    </form>

    <table class="table">
      <thead>
        <tr>
          <th style="width:52px">ID</th>
          <th style="width:80px">Cód.</th>
          <th>Produto</th>
          <th style="width:130px">Categoria</th>
          <th style="width:150px">Fornecedor</th>
          <th style="width:74px;text-align:right">Saldo</th>
          <th style="width:70px;text-align:right">Mín.</th>
          <th style="width:110px">Situação</th>
          <th style="width:170px">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in filtrados" :key="p.id">
          <td class="num muted">{{ p.id }}</td>
          <td class="num muted">{{ p.codigo }}</td>
          <td class="strong">{{ p.nome }}</td>
          <td class="small">{{ p.categoria }}</td>
          <td class="small muted">{{ p.fornecedor }}</td>
          <td class="num strong">{{ p.qtd }}</td>
          <td class="num muted">{{ p.minimo }}</td>
          <td><span class="tag" :class="situacaoProduto(p).tagClasse">{{ situacaoProduto(p).situacao }}</span></td>
          <td>
            <div class="row-actions">
              <button type="button" class="btn btn-ghost" @click="editarProduto(p)">Alterar</button>
              <button type="button" class="btn btn-ghost danger" @click="excluir(p)">Excluir</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="filtrados.length === 0" class="empty">Nenhum produto encontrado para o filtro atual.</p>
  </section>
</template>

<style scoped>
.block { display: flex; flex-direction: column; gap: var(--space-4); }
.block-head {
  display: flex; align-items: center; gap: var(--space-3);
  border-bottom: 1px solid var(--color-divider); padding-bottom: var(--space-3); flex-wrap: wrap;
}
.block-head h6 { margin: 0; margin-right: auto; }
.block-head__meta { font-size: 11px; color: color-mix(in srgb, var(--color-text) 55%, transparent); }
.search { width: 320px; max-width: 100%; }

.form { padding: var(--space-6); gap: var(--space-4); }
.form-head { display: flex; align-items: baseline; gap: var(--space-3); }
.form-head h3 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 0.02em; }
.form-hint { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent-700); }
.form-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-4); }
.form-actions { display: flex; gap: var(--space-2); justify-content: flex-end; }

.num { text-align: right; font-variant-numeric: tabular-nums; }
.muted { color: color-mix(in srgb, var(--color-text) 55%, transparent); }
.small { font-size: 13px; }
.strong { font-family: var(--font-heading); font-size: 16px; }
.row-actions { display: flex; gap: var(--space-1); }
.danger { color: var(--color-neutral-700); }
.empty {
  margin: 0; padding: var(--space-6); text-align: center; font-size: 13px;
  color: color-mix(in srgb, var(--color-text) 55%, transparent); border: 1px dashed var(--color-divider);
}

@media (max-width: 700px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>
