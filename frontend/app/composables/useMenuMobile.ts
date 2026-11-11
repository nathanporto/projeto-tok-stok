// Estado do menu lateral em telas pequenas (gaveta aberta/fechada).
export function useMenuMobile() {
  const aberto = useState('menu-mobile-aberto', () => false)

  return {
    aberto,
    alternar: () => { aberto.value = !aberto.value },
    fechar: () => { aberto.value = false },
  }
}
