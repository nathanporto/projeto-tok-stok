<!--
  Campo de texto com máscara (CNPJ ou telefone), formatando enquanto o usuário digita.
  Uso: <InputMascara v-model="form.cnpj" tipo="cnpj" />
-->
<script setup lang="ts">
import type { TipoMascara } from '~/utils/mascaras'

const props = defineProps<{ tipo: TipoMascara }>()
const modelo = defineModel<string | null>()

const config = computed(() => props.tipo === 'cnpj'
  ? { placeholder: '00.000.000/0000-00', maxlength: 18, inputmode: 'text' as const, autocapitalize: 'characters' }
  : { placeholder: '(11) 91234-5678', maxlength: 15, inputmode: 'tel' as const, autocapitalize: 'off' })

const significativo = /[0-9A-Za-z]/

function aoDigitar(e: Event) {
  const el = e.target as HTMLInputElement
  const cursor = el.selectionStart ?? el.value.length

  // Quantos caracteres "de verdade" (sem pontuação) existem antes do cursor.
  const antesDoCursor = [...el.value.slice(0, cursor)].filter(c => significativo.test(c)).length

  const formatado = aplicarMascara(props.tipo, el.value)
  el.value = formatado
  modelo.value = formatado

  // Recoloca o cursor depois do mesmo número de caracteres, ignorando a pontuação inserida.
  let pos = 0
  let contados = 0
  while (pos < formatado.length && contados < antesDoCursor) {
    if (significativo.test(formatado[pos]!)) contados++
    pos++
  }
  if (document.activeElement === el) el.setSelectionRange(pos, pos)
}
</script>

<template>
  <input
    :value="modelo ?? ''"
    class="input"
    type="text"
    :placeholder="config.placeholder"
    :maxlength="config.maxlength"
    :inputmode="config.inputmode"
    :autocapitalize="config.autocapitalize"
    autocomplete="off"
    @input="aoDigitar"
  >
</template>
