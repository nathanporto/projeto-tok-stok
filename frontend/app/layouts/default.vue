<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const menu = useMenuMobile()
const route = useRoute()

watch(() => route.path, menu.fechar)

onMounted(() => {
  if (auth.isAuthenticated && !auth.user) {
    auth.fetchUser()
  }
})
</script>

<template>
  <div class="shell">
    <AppHeader />

    <div class="shell-body">
      <div v-if="menu.aberto.value" class="shell-backdrop" @click="menu.fechar" />
      <AppSidebar />

      <main class="shell-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
}
.shell-body {
  display: grid;
  /* minmax(0, 1fr): sem isso a coluna cresce até caber a tabela mais larga. */
  grid-template-columns: 236px minmax(0, 1fr);
  align-items: start;
  min-height: calc(100vh - 70px);
}
.shell-main {
  min-width: 0;
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  max-width: 1180px;
}
.shell-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--color-accent-900) 45%, transparent);
}

@media (max-width: 1100px) {
  .shell-body { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 700px) {
  .shell-main { padding: var(--space-6) var(--space-4); gap: var(--space-6); }
}
</style>
