<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

const nomeUsuario = computed(() => auth.user?.name ?? 'Operador de estoque')
const unidade = computed(() => auth.user?.unidade ?? '—')
const iniciais = computed(() => {
  const partes = nomeUsuario.value.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase() || 'OP'
})
</script>

<template>
  <header class="nav header">
    <div class="nav-brand header-brand">
      <span class="header-brand__name">Fábrica Cruzeiro</span>
      <span class="header-brand__sub">Sistema de gestão de estoque — módulo de controle</span>
    </div>
    <span class="tag tag-outline">Tok&amp;Stok</span>
    <span class="tag tag-neutral">Projeto Interdisciplinar 2026</span>
    <div class="header-user">
      <span class="header-avatar">{{ iniciais }}</span>
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
.header-brand { display: flex; flex-direction: column; gap: 2px; margin-right: auto; }
.header-brand__name { font-size: 19px; letter-spacing: 0.02em; text-transform: uppercase; }
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
  width: 28px; height: 28px; display: grid; place-items: center;
  border: 1px solid var(--color-divider); font-family: var(--font-heading); font-size: 12px;
}
.header-user__info { display: flex; flex-direction: column; line-height: 1.2; }
.header-user__name { font-size: 13px; }
.header-user__unit {
  font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text) 50%, transparent);
}
</style>
