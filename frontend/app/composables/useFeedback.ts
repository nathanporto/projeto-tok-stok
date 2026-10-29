export function useFeedback() {
  const mensagem = ref('')
  const tipo = ref('OK')

  function ok(texto: string) {
    tipo.value = 'OK'
    mensagem.value = texto
  }

  function erro(e: unknown) {
    tipo.value = 'Erro'
    mensagem.value = e instanceof Error ? e.message : 'Erro inesperado.'
  }

  function limpar() {
    mensagem.value = ''
  }

  return { mensagem, tipo, ok, erro, limpar }
}
