<script setup lang="ts">
import { IconDiamond, IconUser, IconMail, IconLock, IconEye, IconEyeOff, IconAlertCircle, IconCircleCheck } from '@tabler/icons-vue'

definePageMeta({ layout: false })

const { data: themeSettings } = useFetch<Record<string, string>>('/api/settings')
useTheme(themeSettings)

const sessionCookie = useCookie('mm_session')
const route = useRoute()

onMounted(async () => {
  if (sessionCookie.value) {
    const user = await $fetch<{ role: string }>('/api/auth/me').catch(() => null)
    if (user?.role === 'customer') await navigateTo((route.query.redirect as string) || '/shop')
  }
})

const form = reactive({ name: '', email: '', password: '', passwordConfirm: '' })
const showPassword = ref(false)
const showConfirm = ref(false)
const isLoading = ref(false)
const error = ref('')
const success = ref(false)

const redirectTarget = computed(() => (route.query.redirect as string) || '/shop')

async function handleRegister() {
  error.value = ''

  if (form.password !== form.passwordConfirm) {
    error.value = 'Konfirmasi password tidak cocok'
    return
  }

  isLoading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { name: form.name, email: form.email, password: form.password },
    })
    success.value = true
    setTimeout(() => navigateTo(redirectTarget.value), 1500)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Terjadi kesalahan, coba lagi'
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
          <p class="text-base-content/50 text-sm mt-1">Buat akun untuk mulai berbelanja</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-5">
          <h2 class="text-lg font-semibold text-base-content">Daftar Akun</h2>

          <!-- Success state -->
          <div v-if="success" class="flex flex-col items-center gap-3 py-4">
            <IconCircleCheck class="w-12 h-12 text-success" />
            <p class="text-base-content font-medium">Akun berhasil dibuat!</p>
            <p class="text-sm text-base-content/60">Mengalihkan ke halaman toko...</p>
          </div>

          <form v-else @submit.prevent="handleRegister" class="space-y-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Nama Lengkap</legend>
              <label class="input w-full">
                <IconUser class="w-4 h-4 opacity-40" />
                <input v-model="form.name" type="text" placeholder="Nama lengkap Anda" required />
              </label>
            </fieldset>

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
                  placeholder="Minimal 8 karakter"
                  minlength="8"
                  required
                />
                <button type="button" class="btn btn-ghost btn-xs btn-circle" @click="showPassword = !showPassword">
                  <IconEye v-if="!showPassword" class="w-4 h-4 opacity-40" />
                  <IconEyeOff v-else class="w-4 h-4 opacity-40" />
                </button>
              </label>
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Konfirmasi Password</legend>
              <label class="input w-full">
                <IconLock class="w-4 h-4 opacity-40" />
                <input
                  v-model="form.passwordConfirm"
                  :type="showConfirm ? 'text' : 'password'"
                  placeholder="Ulangi password"
                  required
                />
                <button type="button" class="btn btn-ghost btn-xs btn-circle" @click="showConfirm = !showConfirm">
                  <IconEye v-if="!showConfirm" class="w-4 h-4 opacity-40" />
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
              <template v-else>Daftar Sekarang</template>
            </button>
          </form>

          <div v-if="!success">
            <div class="divider text-xs text-base-content/40 my-0">atau</div>
            <p class="text-sm text-center text-base-content/60 mt-3">
              Sudah punya akun?
              <NuxtLink to="/login" class="link link-primary font-medium">Masuk</NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
