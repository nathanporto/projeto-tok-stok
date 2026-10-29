<script setup lang="ts">
import { useFornecedoresStore, type FornecedorPayload } from '~/stores/fornecedores'
import type { Fornecedor } from '~/types'

const store = useFornecedoresStore()
const feedback = useFeedback()

const busca = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

function carregar() {
  store.fetchAll(busca.value.trim()).catch(feedback.erro)
}

watch(busca, () => {
  clearTimeout(timer)
  timer = setTimeout(carregar, 300)
})

onMounted(carregar)

const formAberto = ref(false)
const salvando = ref(false)
const editandoId = ref<number | null>(null)
const form = ref<FornecedorPayload>(vazio())

function vazio(): FornecedorPayload {
  return { nome: '', cnpj: '', telefone: '', email: '' }
}

function novo() {
  editandoId.value = null
  form.value = vazio()
  formAberto.value = true
}

function editar(f: Fornecedor) {
  editandoId.value = f.id
  form.value = { nome: f.nome, cnpj: f.cnpj ?? '', telefone: f.telefone ?? '', email: f.email ?? '' }
  formAberto.value = true
}

async function salvar() {
  salvando.value = true
  const payload: FornecedorPayload = {
    nome: form.value.nome,
    cnpj: form.value.cnpj || null,
    telefone: form.value.telefone || null,
    email: form.value.email || null,
  }
  try {
    if (editandoId.value) {
      await store.update(editandoId.value, payload)
      feedback.ok(`Fornecedor #${editandoId.value} alterado com sucesso.`)
    } else {
      const criado = await store.create(payload)
      feedback.ok(`Fornecedor cadastrado com sucesso! ID gerado: ${criado.id}`)
    }
    formAberto.value = false
    carregar()
  } catch (e) {
    feedback.erro(e)
  } finally {
    salvando.value = false
  }
}

async function excluir(f: Fornecedor) {
  if (!confirm(`Excluir o fornecedor "${f.nome}"?`)) return
  try {
    await store.remove(f.id)
    feedback.ok(`Fornecedor ${f.nome} excluído.`)
    carregar()
  } catch (e) {
    feedback.erro(e)
  }
}

function limparFiltros() {
  busca.value = ''
  feedback.limpar()
}
</script>

<template>
  <PageHeader
    kicker="Fornecedor · CRUD"
    title="Fornecedores"
    subtitle="Gerenciamento dos fornecedores cadastrados no sistema."
  >
    <template #actions>
      <button type="button" class="btn btn-secondary" @click="limparFiltros">Limpar filtros</button>
      <button type="button" class="btn btn-primary blueprint" @click="novo">
        <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
        + Cadastrar fornecedor
      </button>
    </template>
  </PageHeader>

  <AlertBar v-if="feedback.mensagem.value" :tipo="feedback.tipo.value" :mensagem="feedback.mensagem.value" @fechar="feedback.limpar" />

  <section class="block">
    <div class="block-head">
      <h6>Consultar fornecedores</h6>
      <input v-model="busca" class="input search" type="search" placeholder="Buscar por nome, CNPJ ou e-mail…">
      <span class="block-head__meta">{{ store.fornecedores.length }} fornecedor(es)</span>
    </div>

    <form v-if="formAberto" class="card blueprint form" @submit.prevent="salvar">
      <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
      <div class="form-head">
        <h3>{{ editandoId ? `Alterar fornecedor #${editandoId}` : 'Cadastrar fornecedor' }}</h3>
        <span class="form-hint">Fornecedor.cadastrar() / alterar()</span>
      </div>
      <div class="form-grid">
        <label class="field"><span>Nome</span><input v-model="form.nome" class="input" required placeholder="Nome da empresa"></label>
        <label class="field"><span>CNPJ</span><input v-model="form.cnpj" class="input" placeholder="00.000.000/0000-00" maxlength="18"></label>
        <label class="field"><span>Telefone</span><input v-model="form.telefone" class="input" placeholder="(11) 4321-0000" maxlength="20"></label>
        <label class="field"><span>E-mail</span><input v-model="form.email" class="input" type="email" placeholder="contato@fornecedor.com.br"></label>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="formAberto = false">Cancelar</button>
        <button type="submit" class="btn btn-primary" :disabled="salvando">{{ salvando ? 'Salvando...' : 'Salvar fornecedor' }}</button>
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
        <tr v-for="f in store.fornecedores" :key="f.id">
          <td class="num muted">{{ f.id }}</td>
          <td class="strong">{{ f.nome }}</td>
          <td class="small muted">{{ f.cnpj || '—' }}</td>
          <td class="small">{{ f.telefone || '—' }}</td>
          <td class="small muted">{{ f.email || '—' }}</td>
          <td>
            <div class="row-actions">
              <button type="button" class="btn btn-ghost" @click="editar(f)">Alterar</button>
              <button type="button" class="btn btn-ghost danger" @click="excluir(f)">Excluir</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="!store.carregando && store.fornecedores.length === 0" class="empty">
      {{ busca ? 'Nenhum fornecedor encontrado com esse termo.' : 'Nenhum fornecedor cadastrado ainda.' }}
    </p>
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
