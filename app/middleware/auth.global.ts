export default defineNuxtRouteMiddleware((to) => {
  // Only protect /admin/* routes
  if (!to.path.startsWith('/admin')) return

  // Allow the login page through
  if (to.path === '/admin/login') return

  const sessionCookie = useCookie('mm_session')
  if (!sessionCookie.value) {
    return navigateTo('/admin/login')
  }
})
