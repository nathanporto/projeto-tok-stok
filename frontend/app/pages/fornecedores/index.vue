<script setup lang="ts">
import { useEstoqueMock } from '~/composables/useEstoqueMock'
import type { Fornecedor } from '~/types'

const { fornecedores } = useEstoqueMock()

const busca = ref('')
const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  if (!termo) return fornecedores.value
  return fornecedores.value.filter(f => [f.nome, f.cnpj, f.email].join(' ').toLowerCase().includes(termo))
})

const formAberto = ref(false)
const form = ref<{ id: number | null; nome: string; cnpj: string; telefone: string; email: string }>(vazio())

function vazio() {
  return { id: null, nome: '', cnpj: '', telefone: '', email: '' }
}

function novo() {
  form.value = vazio()
  formAberto.value = true
}

function editar(f: Fornecedor) {
  form.value = { ...f }
  formAberto.value = true
}

function salvar() {
  if (!form.value.nome.trim()) return

  if (form.value.id) {
    const idx = fornecedores.value.findIndex(f => f.id === form.value.id)
    if (idx !== -1) fornecedores.value[idx] = { ...fornecedores.value[idx], ...form.value }
  } else {
    const id = Math.max(0, ...fornecedores.value.map(f => f.id)) + 1
    fornecedores.value.push({
      id,
      nome: form.value.nome.trim(),
      cnpj: form.value.cnpj.trim(),
      telefone: form.value.telefone.trim(),
      email: form.value.email.trim(),
    })
  }

  formAberto.value = false
}

function excluir(f: Fornecedor) {
  fornecedores.value = fornecedores.value.filter(x => x.id !== f.id)
}
</script>

<template>
  <PageHeader
    kicker="Fornecedor · CRUD"
    title="Fornecedores"
    subtitle="Gerenciamento dos fornecedores cadastrados no sistema."
  >
    <template #actions>
      <button type="button" class="btn btn-secondary" @click="busca = ''">Limpar filtros</button>
      <button type="button" class="btn btn-primary blueprint" @click="novo">
        <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
        + Cadastrar fornecedor
      </button>
    </template>
  </PageHeader>

  <section class="block">
    <div class="block-head">
      <h6>Consultar fornecedores</h6>
      <input v-model="busca" class="input search" type="search" placeholder="Buscar por nome, CNPJ ou e-mail…">
      <span class="block-head__meta">{{ filtrados.length }} de {{ fornecedores.length }} fornecedores</span>
    </div>

    <form v-if="formAberto" class="card blueprint form" @submit.prevent="salvar">
      <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
      <div class="form-head">
        <h3>{{ form.id ? `Alterar fornecedor #${form.id}` : 'Cadastrar fornecedor' }}</h3>
        <span class="form-hint">Fornecedor.cadastrar() / alterar()</span>
      </div>
      <div class="form-grid">
        <label class="field"><span>Nome</span><input v-model="form.nome" class="input" placeholder="Nome da empresa"></label>
        <label class="field"><span>CNPJ</span><input v-model="form.cnpj" class="input" placeholder="00.000.000/0000-00"></label>
        <label class="field"><span>Telefone</span><input v-model="form.telefone" class="input" placeholder="(11) 4321-0000"></label>
        <label class="field"><span>E-mail</span><input v-model="form.email" class="input" type="email" placeholder="contato@fornecedor.com.br"></label>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="formAberto = false">Cancelar</button>
        <button type="submit" class="btn btn-primary">Salvar fornecedor</button>
      </div>
    </form>

    <table class="table">
      <thead>
        <tr>
          <th style="width:52px">ID</th>
          <th>Nome</th>
          <th style="width:170px">CNPJ</th>
          <th style="width:150px">Telefone</th>
          <th style="width:230px">E-mail</th>
          <th style="width:150px">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="f in filtrados" :key="f.id">
          <td class="num muted">{{ f.id }}</td>
          <td class="strong">{{ f.nome }}</td>
          <td class="small muted">{{ f.cnpj }}</td>
          <td class="small">{{ f.telefone }}</td>
          <td class="small muted">{{ f.email }}</td>
          <td>
            <div class="row-actions">
              <button type="button" class="btn btn-ghost" @click="editar(f)">Alterar</button>
              <button type="button" class="btn btn-ghost danger" @click="excluir(f)">Excluir</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="filtrados.length === 0" class="empty">Nenhum fornecedor encontrado com esse termo.</p>
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
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); }
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
