<script setup lang="ts">
import type { PontoGrafico } from '~/types'

const props = defineProps<{ pontos: PontoGrafico[] }>()

const maximo = computed(() => Math.max(1, ...props.pontos.flatMap(p => [p.entradas, p.saidas])))
const vazio = computed(() => props.pontos.every(p => p.entradas === 0 && p.saidas === 0))

function altura(valor: number) {
  return `${(valor / maximo.value) * 100}%`
}

function rotuloDia(data: string) {
  const [, mes, dia] = data.split('-')
  return `${dia}/${mes}`
}
</script>

<template>
  <div class="grafico">
    <div class="grafico__barras" role="img" aria-label="Unidades que entraram e saíram nos últimos 7 dias">
      <div v-for="p in pontos" :key="p.data" class="grafico__par">
        <div v-if="p.entradas" class="grafico__barra grafico__barra--entrada" :style="{ height: altura(p.entradas) }" :title="`Entradas: ${p.entradas} un.`">
          <span class="grafico__valor">{{ p.entradas }}</span>
        </div>
        <div v-if="p.saidas" class="grafico__barra grafico__barra--saida" :style="{ height: altura(p.saidas) }" :title="`Saídas: ${p.saidas} un.`">
          <span class="grafico__valor">{{ p.saidas }}</span>
        </div>
      </div>
      <p v-if="vazio" class="grafico__vazio">Sem movimentações nos últimos 7 dias.</p>
    </div>
    <div class="grafico__rotulos">
      <span v-for="p in pontos" :key="p.data">{{ rotuloDia(p.data) }}</span>
    </div>
    <div class="grafico__legenda">
      <span><i class="grafico__chip grafico__barra--entrada"></i>Entradas</span>
      <span><i class="grafico__chip grafico__barra--saida"></i>Saídas</span>
    </div>
  </div>
</template>

<style scoped>
.grafico { display: flex; flex-direction: column; gap: var(--space-3); }
.grafico__barras {
  position: relative;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--space-4);
  height: 180px;
  padding-top: var(--space-6);
  border-bottom: 1px solid var(--color-divider);
}
.grafico__par { display: flex; align-items: flex-end; justify-content: center; gap: 3px; min-height: 0; }
.grafico__barra { position: relative; width: 40%; max-width: 22px; min-height: 0; }
.grafico__barra--entrada { background: var(--color-accent); }
.grafico__barra--saida { background: transparent; border: 1px solid var(--color-accent-700); border-bottom: 0; }
.grafico__valor {
  position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
  padding-bottom: 2px; font-size: 10px; font-variant-numeric: tabular-nums; white-space: nowrap;
  color: color-mix(in srgb, var(--color-text) 70%, transparent);
}
.grafico__rotulos {
  display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: var(--space-4);
  text-align: center; font-size: 10px; letter-spacing: 0.06em; font-variant-numeric: tabular-nums;
  color: color-mix(in srgb, var(--color-text) 55%, transparent);
}
.grafico__vazio {
  position: absolute; inset: 0; display: grid; place-items: center; margin: 0;
  font-size: 13px; color: color-mix(in srgb, var(--color-text) 55%, transparent);
}
.grafico__legenda {
  display: flex; gap: var(--space-4);
  font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text) 60%, transparent);
}
.grafico__legenda span { display: inline-flex; align-items: center; gap: 6px; }
.grafico__chip { display: inline-block; width: 10px; height: 10px; border: 1px solid var(--color-accent-700); }
</style>
