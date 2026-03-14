// Guards /shop route — redirects to / if featureShop is not enabled
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path !== '/shop') return

  const settings = await $fetch<Record<string, string>>('/api/settings').catch(() => null)
  if (settings?.featureShop !== 'true') {
    return navigateTo('/')
  }
})
