<script setup lang="ts">
defineProps<{
  kicker: string
  title: string
  subtitle: string
}>()
</script>

<template>
  <div class="page-header">
    <div class="page-header__text">
      <div class="page-header__kicker">{{ kicker }}</div>
      <h1 class="page-header__title">{{ title }}</h1>
      <p class="page-header__subtitle">{{ subtitle }}</p>
    </div>
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-end;
  gap: var(--space-6);
  border-bottom: 1px solid var(--color-divider);
  padding-bottom: var(--space-4);
  flex-wrap: wrap;
}
.page-header__text { margin-right: auto; }
.page-header__kicker {
  font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--color-accent-700);
}
.page-header__title { margin: 0; font-size: 40px; text-transform: uppercase; letter-spacing: 0.01em; }
.page-header__subtitle {
  margin: 2px 0 0; font-size: 13px;
  color: color-mix(in srgb, var(--color-text) 60%, transparent);
}
.page-header__actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
</style>
