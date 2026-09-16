<script setup lang="ts">
defineProps<{
  kicker: string
  valor: string | number
  nota: string
}>()
</script>

<template>
  <div class="card blueprint kpi">
    <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
    <div class="card-kicker">{{ kicker }}</div>
    <div class="kpi__valor">{{ valor }}</div>
    <div class="card-meta">{{ nota }}</div>
  </div>
</template>

<style scoped>
.kpi { gap: var(--space-2); padding: var(--space-6); }
.kpi__valor { font-family: var(--font-heading); font-weight: 700; font-size: 46px; line-height: 0.95; }
</style>
