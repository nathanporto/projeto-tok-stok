<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

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
  grid-template-columns: 236px 1fr;
  align-items: start;
  min-height: calc(100vh - 70px);
}
.shell-main {
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  max-width: 1180px;
}

@media (max-width: 1100px) {
  .shell-body { grid-template-columns: 1fr; }
}
</style>
