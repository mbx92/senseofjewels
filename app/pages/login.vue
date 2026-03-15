<script setup lang="ts">
import { IconDiamond, IconMail, IconLock, IconEye, IconEyeOff, IconAlertCircle } from '@tabler/icons-vue'

definePageMeta({ layout: false })

const { data: themeSettings } = useFetch<Record<string, string>>('/api/settings')
useTheme(themeSettings)

const route = useRoute()
const sessionCookie = useCookie('mm_session')

// If already logged in as customer, redirect to shop
onMounted(async () => {
  if (sessionCookie.value) {
    const user = await $fetch<{ role: string }>('/api/auth/me').catch(() => null)
    if (user?.role === 'customer') {
      await navigateTo((route.query.redirect as string) || '/shop')
    }
  }
})

const form = reactive({ email: '', password: '' })
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  isLoading.value = true
  try {
    const result = await $fetch<{ role: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: form.email, password: form.password },
    })
    if (result.role !== 'customer') {
      error.value = 'Akun ini bukan akun customer. Gunakan halaman admin untuk login.'
      // Clear the session set by login
      await $fetch('/api/auth/logout', { method: 'POST' })
      return
    }
    await navigateTo((route.query.redirect as string) || '/shop')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Email atau password salah'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center p-6" data-theme="jewels">
    <div class="w-full max-w-sm">
      <!-- Brand -->
      <div class="flex flex-col items-center gap-3 mb-8">
        <div class="bg-primary rounded-xl p-3">
          <IconDiamond class="w-8 h-8 text-secondary" />
        </div>
        <div class="text-center">
          <h1 class="text-xl font-bold text-base-content tracking-tight">Sense of Jewels</h1>
          <p class="text-base-content/50 text-sm mt-1">Masuk ke akun Anda untuk berbelanja</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-5">
          <h2 class="text-lg font-semibold text-base-content">Login</h2>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Email</legend>
              <label class="input w-full">
                <IconMail class="w-4 h-4 opacity-40" />
                <input v-model="form.email" type="email" placeholder="nama@email.com" required />
              </label>
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Password</legend>
              <label class="input w-full">
                <IconLock class="w-4 h-4 opacity-40" />
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Masukkan password"
                  required
                />
                <button type="button" class="btn btn-ghost btn-xs btn-circle" @click="showPassword = !showPassword">
                  <IconEye v-if="!showPassword" class="w-4 h-4 opacity-40" />
                  <IconEyeOff v-else class="w-4 h-4 opacity-40" />
                </button>
              </label>
            </fieldset>

            <div v-if="error" role="alert" class="alert alert-error alert-soft">
              <IconAlertCircle class="w-4 h-4" />
              <span class="text-sm">{{ error }}</span>
            </div>

            <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
              <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
              <template v-else>Masuk</template>
            </button>
          </form>

          <div class="divider text-xs text-base-content/40 my-0">atau</div>

          <p class="text-sm text-center text-base-content/60">
            Belum punya akun?
            <NuxtLink :to="{ path: '/register', query: route.query }" class="link link-primary font-medium">Daftar sekarang</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
