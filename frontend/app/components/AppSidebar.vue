<script setup lang="ts">
const route = useRoute()

const items = [
  { num: '01', label: 'Dashboard', to: '/dashboard' },
  { num: '02', label: 'Produtos', to: '/produtos' },
  { num: '03', label: 'Categorias', to: '/categorias' },
  { num: '04', label: 'Fornecedores', to: '/fornecedores' },
  { num: '05', label: 'Movimentações', to: '/movimentacoes' },
  { num: '06', label: 'Histórico', to: '/historico' },
  { num: '07', label: 'Relatórios', to: '/relatorios' },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <aside class="sidebar">
    <div>
      <h6 class="sidebar-title">Módulos</h6>
      <nav class="sidebar-nav">
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="sidebar-item"
          :class="{ 'is-active': isActive(item.to) }"
        >
          <span class="sidebar-item__num">{{ item.num }}</span>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </div>

    <div class="card blueprint sidebar-rule">
      <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
      <div class="card-kicker">Regra do sistema</div>
      <p class="card-body">estoque atual = estoque anterior + entradas − saídas</p>
      <div class="card-meta">Saídas maiores que o saldo são bloqueadas</div>
    </div>

    <div class="sidebar-footer">
      <div>Univ. Cruzeiro do Sul</div>
      <div>São Paulo / Guarulhos</div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-8) var(--space-4);
  border-right: 1px solid var(--color-divider);
}
.sidebar-title {
  margin: 0 0 var(--space-3);
  padding-left: var(--space-2);
  color: color-mix(in srgb, var(--color-text) 55%, transparent);
}
.sidebar-nav { display: flex; flex-direction: column; gap: 2px; }
.sidebar-item {
  display: grid;
  grid-template-columns: 22px 1fr;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: 9px var(--space-2);
  border: 1px solid transparent;
  text-align: left;
  text-decoration: none;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.01em;
  color: var(--color-text);
}
.sidebar-item:hover { background: color-mix(in srgb, var(--color-accent) 12%, transparent); }
.sidebar-item.is-active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg);
}
.sidebar-item__num {
  font-family: var(--font-body);
  font-size: 10px;
  letter-spacing: 0.08em;
  opacity: 0.6;
}

.sidebar-rule { gap: var(--space-2); padding: var(--space-4); margin: 0 var(--space-2); }
.sidebar-rule .card-body { margin: 0; font-size: 12px; line-height: 1.5; }

.sidebar-footer {
  margin-top: auto;
  padding: 0 var(--space-2);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text) 45%, transparent);
}
</style>
