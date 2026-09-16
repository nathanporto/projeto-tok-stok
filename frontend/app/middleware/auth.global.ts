const publicRoutes = ['/login']

export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('tokstok_token')

  const isPublic = publicRoutes.includes(to.path)

  if (!token.value && !isPublic) {
    return navigateTo('/login')
  }

  if (token.value && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
