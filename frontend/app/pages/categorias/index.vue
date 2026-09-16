<script setup lang="ts">
import { useEstoqueMock } from '~/composables/useEstoqueMock'
import type { Categoria } from '~/types'

const { categorias } = useEstoqueMock()

const busca = ref('')
const filtradas = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  if (!termo) return categorias.value
  return categorias.value.filter(c => [c.nome, c.descricao].join(' ').toLowerCase().includes(termo))
})

const formAberto = ref(false)
const form = ref<{ id: number | null; nome: string; descricao: string; status: 'Ativa' | 'Inativa' }>(vazio())

function vazio() {
  return { id: null, nome: '', descricao: '', status: 'Ativa' as const }
}

function nova() {
  form.value = vazio()
  formAberto.value = true
}

function editar(c: Categoria) {
  form.value = { ...c }
  formAberto.value = true
}

function salvar() {
  if (!form.value.nome.trim()) return

  if (form.value.id) {
    const idx = categorias.value.findIndex(c => c.id === form.value.id)
    if (idx !== -1) categorias.value[idx] = { ...categorias.value[idx], ...form.value }
  } else {
    const id = Math.max(0, ...categorias.value.map(c => c.id)) + 1
    categorias.value.push({ id, nome: form.value.nome.trim(), descricao: form.value.descricao.trim(), status: form.value.status })
  }

  formAberto.value = false
}

function excluir(c: Categoria) {
  categorias.value = categorias.value.filter(x => x.id !== c.id)
}
</script>

<template>
  <PageHeader
    kicker="Categoria · CRUD"
    title="Categorias"
    subtitle="Organize os produtos do estoque por categoria."
  >
    <template #actions>
      <button type="button" class="btn btn-secondary" @click="busca = ''">Limpar filtros</button>
      <button type="button" class="btn btn-primary blueprint" @click="nova">
        <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
        + Cadastrar categoria
      </button>
    </template>
  </PageHeader>

  <section class="block">
    <div class="block-head">
      <h6>Consultar categorias</h6>
      <input v-model="busca" class="input search" type="search" placeholder="Buscar por nome ou descrição…">
      <span class="block-head__meta">{{ filtradas.length }} de {{ categorias.length }} categorias</span>
    </div>

    <form v-if="formAberto" class="card blueprint form" @submit.prevent="salvar">
      <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
      <div class="form-head">
        <h3>{{ form.id ? `Alterar categoria #${form.id}` : 'Cadastrar categoria' }}</h3>
        <span class="form-hint">Categoria.cadastrar() / alterar()</span>
      </div>
      <div class="form-grid">
        <label class="field"><span>Nome</span><input v-model="form.nome" class="input" placeholder="Componentes"></label>
        <label class="field"><span>Descrição</span><input v-model="form.descricao" class="input" placeholder="Peças mecânicas de montagem"></label>
        <label class="field">
          <span>Status</span>
          <select v-model="form.status" class="input">
            <option>Ativa</option>
            <option>Inativa</option>
          </select>
        </label>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="formAberto = false">Cancelar</button>
        <button type="submit" class="btn btn-primary">Salvar categoria</button>
      </div>
    </form>

    <table class="table">
      <thead>
        <tr>
          <th style="width:52px">ID</th>
          <th>Nome</th>
          <th>Descrição</th>
          <th style="width:110px">Status</th>
          <th style="width:150px">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in filtradas" :key="c.id">
          <td class="num muted">{{ c.id }}</td>
          <td class="strong">{{ c.nome }}</td>
          <td class="small muted">{{ c.descricao }}</td>
          <td><span class="tag" :class="c.status === 'Ativa' ? 'tag-accent' : 'tag-neutral'">{{ c.status }}</span></td>
          <td>
            <div class="row-actions">
              <button type="button" class="btn btn-ghost" @click="editar(c)">Alterar</button>
              <button type="button" class="btn btn-ghost danger" @click="excluir(c)">Excluir</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="filtradas.length === 0" class="empty">Nenhuma categoria encontrada com esse termo.</p>
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
