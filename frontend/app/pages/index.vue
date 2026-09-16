<script setup lang="ts">
const token = useCookie('tokstok_token')

await navigateTo(token.value ? '/dashboard' : '/login')
</script>

<template>
  <div />
</template>
