export const useAuth = () => {
  const sessionCookie = useCookie<string | null>('mm_session', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  })

  const user = useState<{ id: string; email: string; name: string; role: string } | null>('auth_user', () => null)

  const isLoggedIn = computed(() => !!sessionCookie.value)
  const isSuperAdmin = computed(() => user.value?.role === 'superadmin')

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
    await navigateTo('/admin/login')
  }

  return { user, isLoggedIn, isSuperAdmin, fetchUser, logout }
}
