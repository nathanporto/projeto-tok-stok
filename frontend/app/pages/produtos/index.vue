<script setup lang="ts">
import { useCategoriasStore } from '~/stores/categorias'
import { useFornecedoresStore } from '~/stores/fornecedores'
import { useProdutosStore, type ProdutoFiltros, type ProdutoPayload } from '~/stores/produtos'
import type { Produto } from '~/types'

const store = useProdutosStore()
const categoriasStore = useCategoriasStore()
const fornecedoresStore = useFornecedoresStore()
const feedback = useFeedback()

const filtros = reactive<Required<ProdutoFiltros>>({
  busca: '',
  categoria_id: null,
  fornecedor_id: null,
  situacao: '',
})

function carregar() {
  store.fetchAll({ ...filtros, busca: filtros.busca.trim() }).catch(feedback.erro)
}

let timer: ReturnType<typeof setTimeout> | undefined
watch(() => filtros.busca, () => {
  clearTimeout(timer)
  timer = setTimeout(carregar, 300)
})
watch(() => [filtros.categoria_id, filtros.fornecedor_id, filtros.situacao], carregar)

onMounted(() => {
  carregar()
  categoriasStore.fetchAll().catch(feedback.erro)
  fornecedoresStore.fetchAll().catch(feedback.erro)
})

type FormProduto = Omit<ProdutoPayload, 'quantidade' | 'estoque_minimo' | 'estoque_maximo' | 'preco_custo'> & {
  quantidade: number | string
  estoque_minimo: number | string
  estoque_maximo: number | string
  preco_custo: number | string
}

const formAberto = ref(false)
const salvando = ref(false)
const editandoId = ref<number | null>(null)
const form = ref<FormProduto>(vazio())
const visualizando = ref<Produto | null>(null)

function vazio(): FormProduto {
  return {
    codigo: '', nome: '', categoria_id: null, fornecedor_id: null,
    quantidade: 0, estoque_minimo: 0, estoque_maximo: 0, preco_custo: 0,
  }
}

function novo() {
  editandoId.value = null
  visualizando.value = null
  form.value = vazio()
  formAberto.value = true
}

function editar(p: Produto) {
  editandoId.value = p.id
  visualizando.value = null
  form.value = {
    codigo: p.codigo,
    nome: p.nome,
    categoria_id: p.categoria_id,
    fornecedor_id: p.fornecedor_id,
    quantidade: p.quantidade,
    estoque_minimo: p.estoque_minimo,
    estoque_maximo: p.estoque_maximo,
    preco_custo: Number(p.preco_custo),
  }
  formAberto.value = true
}

function visualizar(p: Produto) {
  formAberto.value = false
  visualizando.value = p
}

async function salvar() {
  salvando.value = true
  const payload: ProdutoPayload = {
    ...form.value,
    quantidade: Number(form.value.quantidade) || 0,
    estoque_minimo: Number(form.value.estoque_minimo) || 0,
    estoque_maximo: Number(form.value.estoque_maximo) || 0,
    preco_custo: Number(form.value.preco_custo) || 0,
  }
  try {
    if (editandoId.value) {
      await store.update(editandoId.value, payload)
      feedback.ok(`Produto #${editandoId.value} alterado com sucesso.`)
    } else {
      const criado = await store.create(payload)
      feedback.ok(`Produto cadastrado com sucesso! ID gerado: ${criado.id}`)
    }
    formAberto.value = false
    carregar()
  } catch (e) {
    feedback.erro(e)
  } finally {
    salvando.value = false
  }
}

async function excluir(p: Produto) {
  if (!confirm(`Excluir o produto "${p.nome}"? O histórico de movimentações dele também será removido.`)) return
  try {
    await store.remove(p.id)
    if (visualizando.value?.id === p.id) visualizando.value = null
    feedback.ok(`Produto ${p.nome} excluído do estoque.`)
    carregar()
  } catch (e) {
    feedback.erro(e)
  }
}

function limparFiltros() {
  filtros.busca = ''
  filtros.categoria_id = null
  filtros.fornecedor_id = null
  filtros.situacao = ''
  feedback.limpar()
}
</script>

<template>
  <PageHeader
    kicker="Produto · CRUD"
    title="Produtos"
    subtitle="Cadastrar, consultar, alterar e excluir itens do estoque industrial."
  >
    <template #actions>
      <button type="button" class="btn btn-secondary" @click="limparFiltros">Limpar filtros</button>
      <button type="button" class="btn btn-primary blueprint" @click="novo">
        <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
        + Cadastrar produto
      </button>
    </template>
  </PageHeader>

  <AlertBar v-if="feedback.mensagem.value" :tipo="feedback.tipo.value" :mensagem="feedback.mensagem.value" @fechar="feedback.limpar" />

  <section class="block">
    <div class="block-head">
      <h6>Consultar estoque</h6>
      <span class="block-head__meta">{{ store.produtos.length }} produto(s)</span>
    </div>

    <div class="filtros">
      <input v-model="filtros.busca" class="input" type="search" placeholder="Buscar por nome ou código…">
      <select v-model="filtros.categoria_id" class="input">
        <option :value="null">Todas as categorias</option>
        <option v-for="c in categoriasStore.categorias" :key="c.id" :value="c.id">{{ c.nome }}</option>
      </select>
      <select v-model="filtros.fornecedor_id" class="input">
        <option :value="null">Todos os fornecedores</option>
        <option v-for="f in fornecedoresStore.fornecedores" :key="f.id" :value="f.id">{{ f.nome }}</option>
      </select>
      <select v-model="filtros.situacao" class="input">
        <option value="">Todas as situações</option>
        <option value="regular">Regular</option>
        <option value="baixo">Abaixo do mínimo</option>
        <option value="sem_estoque">Sem estoque</option>
      </select>
    </div>

    <form v-if="formAberto" class="card blueprint form" @submit.prevent="salvar">
      <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
      <div class="form-head">
        <h3>{{ editandoId ? `Alterar produto #${editandoId}` : 'Cadastrar produto' }}</h3>
        <span class="form-hint">Produto.cadastrar() / alterar()</span>
      </div>
      <div class="form-grid">
        <label class="field"><span>Nome do produto</span><input v-model="form.nome" class="input" required placeholder="Rolamento 6204 ZZ"></label>
        <label class="field"><span>Código</span><input v-model="form.codigo" class="input" required placeholder="PRD-000"></label>
        <label class="field">
          <span>Categoria</span>
          <select v-model="form.categoria_id" class="input">
            <option :value="null">Sem categoria</option>
            <option v-for="c in categoriasStore.categorias" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </select>
        </label>
        <label class="field">
          <span>Fornecedor</span>
          <select v-model="form.fornecedor_id" class="input">
            <option :value="null">Sem fornecedor</option>
            <option v-for="f in fornecedoresStore.fornecedores" :key="f.id" :value="f.id">{{ f.nome }}</option>
          </select>
        </label>
        <label class="field"><span>Preço/custo (R$)</span><input v-model="form.preco_custo" class="input" type="number" step="0.01" min="0" required></label>
        <label class="field"><span>Quantidade em estoque</span><input v-model="form.quantidade" class="input" type="number" min="0" required></label>
        <label class="field"><span>Estoque mínimo</span><input v-model="form.estoque_minimo" class="input" type="number" min="0" required></label>
        <label class="field"><span>Estoque máximo</span><input v-model="form.estoque_maximo" class="input" type="number" min="0" required></label>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="formAberto = false">Cancelar</button>
        <button type="submit" class="btn btn-primary" :disabled="salvando">{{ salvando ? 'Salvando...' : 'Salvar produto' }}</button>
      </div>
    </form>

    <div v-if="visualizando" class="card blueprint form">
      <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
      <div class="form-head">
        <h3>{{ visualizando.nome }}</h3>
        <span class="form-hint">Produto #{{ visualizando.id }} · {{ visualizando.codigo }}</span>
        <span class="tag" :class="situacaoEstoque(visualizando.quantidade, visualizando.estoque_minimo).tagClasse">
          {{ situacaoEstoque(visualizando.quantidade, visualizando.estoque_minimo).situacao }}
        </span>
      </div>
      <dl class="detalhes">
        <div><dt>Categoria</dt><dd>{{ visualizando.categoria?.nome ?? '—' }}</dd></div>
        <div><dt>Fornecedor</dt><dd>{{ visualizando.fornecedor?.nome ?? '—' }}</dd></div>
        <div><dt>Preço/custo</dt><dd>{{ formatarMoeda(visualizando.preco_custo) }}</dd></div>
        <div><dt>Quantidade em estoque</dt><dd>{{ visualizando.quantidade }} un.</dd></div>
        <div><dt>Estoque mínimo</dt><dd>{{ visualizando.estoque_minimo }} un.</dd></div>
        <div><dt>Estoque máximo</dt><dd>{{ visualizando.estoque_maximo }} un.</dd></div>
      </dl>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="visualizando = null">Fechar</button>
        <button type="button" class="btn btn-primary" @click="editar(visualizando)">Alterar</button>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th style="width:52px">ID</th>
          <th style="width:90px">Cód.</th>
          <th>Produto</th>
          <th style="width:130px">Categoria</th>
          <th style="width:150px">Fornecedor</th>
          <th style="width:90px;text-align:right">Custo</th>
          <th style="width:74px;text-align:right">Saldo</th>
          <th style="width:70px;text-align:right">Mín.</th>
          <th style="width:110px">Situação</th>
          <th style="width:190px">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in store.produtos" :key="p.id">
          <td class="num muted">{{ p.id }}</td>
          <td class="muted">{{ p.codigo }}</td>
          <td class="strong">{{ p.nome }}</td>
          <td class="small">{{ p.categoria?.nome ?? '—' }}</td>
          <td class="small muted">{{ p.fornecedor?.nome ?? '—' }}</td>
          <td class="num small">{{ formatarMoeda(p.preco_custo) }}</td>
          <td class="num strong">{{ p.quantidade }}</td>
          <td class="num muted">{{ p.estoque_minimo }}</td>
          <td><span class="tag" :class="situacaoEstoque(p.quantidade, p.estoque_minimo).tagClasse">{{ situacaoEstoque(p.quantidade, p.estoque_minimo).situacao }}</span></td>
          <td>
            <div class="row-actions">
              <button type="button" class="btn btn-ghost" @click="visualizar(p)">Ver</button>
              <button type="button" class="btn btn-ghost" @click="editar(p)">Alterar</button>
              <button type="button" class="btn btn-ghost danger" @click="excluir(p)">Excluir</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="!store.carregando && store.produtos.length === 0" class="empty">
      Nenhum produto encontrado. Use "+ Cadastrar produto" para adicionar o primeiro item.
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
.filtros { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: var(--space-3); }

.form { padding: var(--space-6); gap: var(--space-4); }
.form-head { display: flex; align-items: baseline; gap: var(--space-3); flex-wrap: wrap; }
.form-head h3 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 0.02em; }
.form-hint { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent-700); }
.form-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-4); }
.form-actions { display: flex; gap: var(--space-2); justify-content: flex-end; }

.detalhes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-4); margin: 0; }
.detalhes dt {
  font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text) 55%, transparent);
}
.detalhes dd { margin: 2px 0 0; font-family: var(--font-heading); font-size: 18px; }

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

@media (max-width: 1100px) {
  .filtros, .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .detalhes { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 700px) {
  .filtros, .form-grid, .detalhes { grid-template-columns: 1fr; }
}
</style>
