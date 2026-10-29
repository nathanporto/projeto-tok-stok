<script setup lang="ts">
defineProps<{
  tipo: string
  mensagem: string
}>()

defineEmits<{ fechar: [] }>()
</script>

<template>
  <div class="blueprint alert-bar">
    <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
    <span class="alert-bar__tipo">{{ tipo }}</span>
    <span class="alert-bar__msg">{{ mensagem }}</span>
    <button type="button" class="btn btn-ghost alert-bar__fechar" @click="$emit('fechar')">Fechar</button>
  </div>
</template>

<style scoped>
.alert-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: color-mix(in srgb, var(--color-accent) 9%, transparent);
  border-color: var(--color-accent);
}
.alert-bar__tipo {
  font-family: var(--font-heading);
  font-size: 14px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-accent-700);
}
.alert-bar__msg { font-size: 14px; }
.alert-bar__fechar { margin-left: auto; }
</style>
