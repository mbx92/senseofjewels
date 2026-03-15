// Guards /shop and /checkout routes based on feature flags
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path !== '/shop' && to.path !== '/checkout') return

  const settings = await $fetch<Record<string, string>>('/api/settings').catch(() => null)

  if (to.path === '/shop' && settings?.featureShop !== 'true') {
    return navigateTo('/')
  }

  if (to.path === '/checkout' && settings?.featureCart !== 'true') {
    return navigateTo('/shop')
  }
})
