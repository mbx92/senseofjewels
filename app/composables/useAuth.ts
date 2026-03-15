export const useAuth = () => {
  const sessionCookie = useCookie<string | null>('mm_session', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  })

  const user = useState<{ id: string; email: string; name: string; role: string } | null>('auth_user', () => null)

  const isLoggedIn = computed(() => !!sessionCookie.value)
  const isSuperAdmin = computed(() => user.value?.role === 'superadmin')
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'superadmin')
  const isCustomer = computed(() => user.value?.role === 'customer')

  async function fetchUser() {
    if (!sessionCookie.value) return
    try {
      user.value = await $fetch('/api/auth/me')
    } catch {
      user.value = null
    }
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    sessionCookie.value = null
    user.value = null
    const isOnShop = useRoute().path.startsWith('/shop') || useRoute().path === '/login' || useRoute().path === '/register'
    await navigateTo(isOnShop ? '/login' : '/admin/login')
  }

  return { user, isLoggedIn, isSuperAdmin, isAdmin, isCustomer, fetchUser, logout }
}
