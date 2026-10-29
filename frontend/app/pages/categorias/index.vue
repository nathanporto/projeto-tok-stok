<script setup lang="ts">
import { useCategoriasStore, type CategoriaPayload } from '~/stores/categorias'
import type { Categoria } from '~/types'

const store = useCategoriasStore()
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
const form = ref<CategoriaPayload>(vazio())

function vazio(): CategoriaPayload {
  return { nome: '', descricao: '', status: 'ativa' }
}

function nova() {
  editandoId.value = null
  form.value = vazio()
  formAberto.value = true
}

function editar(c: Categoria) {
  editandoId.value = c.id
  form.value = { nome: c.nome, descricao: c.descricao ?? '', status: c.status }
  formAberto.value = true
}

async function salvar() {
  salvando.value = true
  try {
    if (editandoId.value) {
      await store.update(editandoId.value, form.value)
      feedback.ok(`Categoria #${editandoId.value} alterada com sucesso.`)
    } else {
      const criada = await store.create(form.value)
      feedback.ok(`Categoria cadastrada com sucesso! ID gerado: ${criada.id}`)
    }
    formAberto.value = false
    carregar()
  } catch (e) {
    feedback.erro(e)
  } finally {
    salvando.value = false
  }
}

async function excluir(c: Categoria) {
  if (!confirm(`Excluir a categoria "${c.nome}"? Os produtos dela ficarão sem categoria.`)) return
  try {
    await store.remove(c.id)
    feedback.ok(`Categoria ${c.nome} excluída.`)
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
    kicker="Categoria · CRUD"
    title="Categorias"
    subtitle="Organize os produtos do estoque por categoria."
  >
    <template #actions>
      <button type="button" class="btn btn-secondary" @click="limparFiltros">Limpar filtros</button>
      <button type="button" class="btn btn-primary blueprint" @click="nova">
        <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
        + Cadastrar categoria
      </button>
    </template>
  </PageHeader>

  <AlertBar v-if="feedback.mensagem.value" :tipo="feedback.tipo.value" :mensagem="feedback.mensagem.value" @fechar="feedback.limpar" />

  <section class="block">
    <div class="block-head">
      <h6>Consultar categorias</h6>
      <input v-model="busca" class="input search" type="search" placeholder="Buscar por nome ou descrição…">
      <span class="block-head__meta">{{ store.categorias.length }} categoria(s)</span>
    </div>

    <form v-if="formAberto" class="card blueprint form" @submit.prevent="salvar">
      <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
      <div class="form-head">
        <h3>{{ editandoId ? `Alterar categoria #${editandoId}` : 'Cadastrar categoria' }}</h3>
        <span class="form-hint">Categoria.cadastrar() / alterar()</span>
      </div>
      <div class="form-grid">
        <label class="field"><span>Nome</span><input v-model="form.nome" class="input" required placeholder="Componentes"></label>
        <label class="field"><span>Descrição</span><input v-model="form.descricao" class="input" placeholder="Peças mecânicas de montagem"></label>
        <label class="field">
          <span>Status</span>
          <select v-model="form.status" class="input">
            <option value="ativa">Ativa</option>
            <option value="inativa">Inativa</option>
          </select>
        </label>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="formAberto = false">Cancelar</button>
        <button type="submit" class="btn btn-primary" :disabled="salvando">{{ salvando ? 'Salvando...' : 'Salvar categoria' }}</button>
      </div>
    </form>

    <table class="table">
      <thead>
        <tr>
          <th style="width:52px">ID</th>
          <th>Nome</th>
          <th>Descrição</th>
          <th style="width:90px;text-align:right">Produtos</th>
          <th style="width:110px">Status</th>
          <th style="width:150px">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in store.categorias" :key="c.id">
          <td class="num muted">{{ c.id }}</td>
          <td class="strong">{{ c.nome }}</td>
          <td class="small muted">{{ c.descricao || '—' }}</td>
          <td class="num">{{ c.produtos_count ?? 0 }}</td>
          <td><span class="tag" :class="c.status === 'ativa' ? 'tag-accent' : 'tag-neutral'">{{ c.status === 'ativa' ? 'Ativa' : 'Inativa' }}</span></td>
          <td>
            <div class="row-actions">
              <button type="button" class="btn btn-ghost" @click="editar(c)">Alterar</button>
              <button type="button" class="btn btn-ghost danger" @click="excluir(c)">Excluir</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="!store.carregando && store.categorias.length === 0" class="empty">
      {{ busca ? 'Nenhuma categoria encontrada com esse termo.' : 'Nenhuma categoria cadastrada ainda.' }}
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
