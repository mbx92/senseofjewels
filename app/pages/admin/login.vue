<template>
  <div class="min-h-screen bg-base-200 flex" data-theme="jewels">
    <!-- Left Panel - Branding -->
    <div class="hidden lg:flex lg:w-[45%] bg-primary relative overflow-hidden">
      <div class="absolute inset-0">
        <div class="absolute -top-24 -left-24 w-96 h-96 bg-secondary/15 rounded-full"></div>
        <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full translate-x-1/4 translate-y-1/4"></div>
        <div class="absolute top-1/2 left-1/3 w-48 h-48 bg-secondary/10 rounded-full"></div>
      </div>
      <div class="relative z-10 flex flex-col justify-between p-12 w-full">
        <div class="flex items-center gap-3">
          <div class="bg-secondary rounded-lg p-2.5">
            <IconDiamond class="w-7 h-7 text-secondary-content" />
          </div>
          <span class="text-xl font-bold text-white tracking-tight">Sense of Jewels</span>
        </div>

        <div class="max-w-sm">
          <h1 class="text-4xl font-bold text-white leading-tight mb-4">
            Manage Your <br/>
            <span class="text-secondary">Landing Page.</span>
          </h1>
          <p class="text-primary-content/70 leading-relaxed">
            Content management system for Sense of Jewels — manage sections, collections, products, and testimonials for your landing page.
          </p>
        </div>

        <div class="grid grid-cols-3 gap-6">
          <div>
            <div class="bg-white/10 rounded-lg p-3 w-fit mb-3">
              <IconLayoutList class="w-5 h-5 text-secondary" />
            </div>
            <p class="text-sm font-medium text-white">Page Sections</p>
            <p class="text-xs text-primary-content/50 mt-1">Manage landing content</p>
          </div>
          <div>
            <div class="bg-white/10 rounded-lg p-3 w-fit mb-3">
              <IconDiamond class="w-5 h-5 text-secondary" />
            </div>
            <p class="text-sm font-medium text-white">Products</p>
            <p class="text-xs text-primary-content/50 mt-1">Jewelry catalog</p>
          </div>
          <div>
            <div class="bg-white/10 rounded-lg p-3 w-fit mb-3">
              <IconPhoto class="w-5 h-5 text-secondary" />
            </div>
            <p class="text-sm font-medium text-white">Media Library</p>
            <p class="text-xs text-primary-content/50 mt-1">Images & assets</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel - Login Form -->
    <div class="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md">
        <!-- Mobile Brand -->
        <div class="flex items-center gap-3 mb-10 lg:hidden">
          <div class="bg-primary rounded-lg p-2.5">
            <IconDiamond class="w-6 h-6 text-primary-content" />
          </div>
          <span class="text-xl font-bold text-base-content tracking-tight">Sense of Jewels</span>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold text-base-content">Sign in</h2>
          <p class="text-base-content/50 mt-1 text-sm">Enter your credentials to access the CMS</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Email Address</legend>
            <label class="input w-full">
              <IconMail class="w-4 h-4 opacity-40" />
              <input
                v-model="form.email"
                type="email"
                placeholder="nama@email.com"
                required
              />
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

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="form.remember" type="checkbox" class="checkbox checkbox-primary checkbox-sm" />
              <span class="text-sm text-base-content/60">Remember me</span>
            </label>
            <a class="link link-primary text-sm link-hover font-medium">Forgot password?</a>
          </div>

          <!-- Error Alert -->
          <div v-if="error" role="alert" class="alert alert-error alert-soft">
            <IconAlertCircle class="w-4 h-4" />
            <span class="text-sm">{{ error }}</span>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
            <template v-else>Sign In</template>
          </button>
        </form>

        <p class="text-center mt-8 text-sm text-base-content/50">
          Sense of Jewels CMS
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IconDiamond,
  IconLayoutList,
  IconPhoto,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconAlertCircle,
} from '@tabler/icons-vue'

definePageMeta({
  layout: false,
})

const form = reactive({
  email: '',
  password: '',
  remember: false,
})
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  isLoading.value = true

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: form.email, password: form.password },
    })
    await navigateTo('/admin')
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Login failed'
  } finally {
    isLoading.value = false
  }
}
</script>
