<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const menu = useMenuMobile()

const nomeUsuario = computed(() => auth.user?.name ?? 'Operador de estoque')
const unidade = computed(() => auth.user?.unidade ?? '—')
const iniciais = computed(() => {
  const partes = nomeUsuario.value.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase() || 'OP'
})
</script>

<template>
  <header class="nav header">
    <button
      type="button"
      class="btn btn-secondary header-menu"
      aria-controls="menu-lateral"
      :aria-expanded="menu.aberto.value"
      @click="menu.alternar"
    >
      <span class="header-menu__icone" aria-hidden="true"><i></i><i></i><i></i></span>
      Menu
    </button>
    <div class="nav-brand header-brand">
      <span class="header-brand__name">Fábrica Cruzeiro</span>
      <span class="header-brand__sub">Sistema de gestão de estoque — módulo de controle</span>
    </div>
    <span class="tag tag-outline header-tag">Tok&amp;Stok</span>
    <span class="tag tag-neutral header-tag">Projeto Interdisciplinar 2026</span>
    <div class="header-user">
      <span class="header-avatar" :title="`${nomeUsuario} · ${unidade}`">{{ iniciais }}</span>
      <span class="header-user__info">
        <span class="header-user__name">{{ nomeUsuario }}</span>
        <span class="header-user__unit">{{ unidade }}</span>
      </span>
      <button type="button" class="btn btn-secondary" @click="auth.logout()">Sair</button>
    </div>
  </header>
</template>

<style scoped>
.header {
  padding: var(--space-4) var(--space-8);
  border-bottom: 1px solid var(--color-divider);
  gap: var(--space-6);
}
.header-brand { display: flex; flex-direction: column; gap: 2px; margin-right: auto; min-width: 0; }
.header-brand__name { font-size: 19px; letter-spacing: 0.02em; text-transform: uppercase; white-space: nowrap; }
.header-brand__sub {
  font-family: var(--font-body); font-weight: 400; font-size: 11px;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text) 50%, transparent);
}
.header-user {
  display: flex; align-items: center; gap: var(--space-2);
  padding-left: var(--space-4); border-left: 1px solid var(--color-divider);
}
.header-avatar {
  width: 28px; height: 28px; flex: none; display: grid; place-items: center;
  border: 1px solid var(--color-divider); font-family: var(--font-heading); font-size: 12px;
}
.header-user__info { display: flex; flex-direction: column; line-height: 1.2; }
.header-user__name { font-size: 13px; white-space: nowrap; }
.header-user__unit {
  font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap;
  color: color-mix(in srgb, var(--color-text) 50%, transparent);
}

.header-menu { display: none; }
.header-menu__icone { display: inline-flex; flex-direction: column; gap: 3px; width: 14px; }
.header-menu__icone i { display: block; height: 1.5px; background: currentColor; }

@media (max-width: 1100px) {
  .header { padding: var(--space-3) var(--space-6); gap: var(--space-4); }
  .header-menu { display: inline-flex; }
  .header-tag { display: none; }
}
@media (max-width: 700px) {
  .header { padding: var(--space-3) var(--space-4); gap: var(--space-3); }
  .header-brand__name { font-size: 16px; }
  .header-brand__sub, .header-user__info { display: none; }
  .header-user { padding-left: var(--space-3); }
}
@media (max-width: 340px) {
  .header-brand { display: none; }
  .header-user { margin-left: auto; }
}
</style>
