<template>
  <div class="min-h-screen bg-base-200">
    <div class="drawer lg:drawer-open">
      <input id="main-drawer" type="checkbox" class="drawer-toggle" />

      <!-- Main Content -->
      <div class="drawer-content flex flex-col">
        <!-- Top Navbar -->
        <div class="navbar bg-base-100 border-b border-base-300 sticky top-0 z-30">
          <div class="flex-none lg:hidden">
            <label for="main-drawer" class="btn btn-ghost btn-square">
              <IconMenu2 class="w-5 h-5" />
            </label>
          </div>
          <div class="flex-1">
            <div class="text-sm breadcrumbs px-2">
              <ul>
                <li class="text-base-content/50">Sense of Jewels</li>
                <li class="font-medium">{{ pageTitle }}</li>
              </ul>
            </div>
          </div>
          <div class="flex-none gap-2">
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar avatar-placeholder">
                <div class="bg-primary text-primary-content w-9 rounded-full flex items-center justify-center">
                  <span class="text-sm font-bold">{{ auth.user.value?.name?.charAt(0) || 'A' }}</span>
                </div>
              </div>
              <ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-lg border border-base-300">
                <li><a><IconUser class="w-4 h-4" /> Profile</a></li>
                <li><a><IconSettings class="w-4 h-4" /> Settings</a></li>
                <li class="border-t border-base-300 mt-1 pt-1">
                  <a class="text-error" @click="auth.logout()"><IconLogout class="w-4 h-4" /> Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Page Content -->
        <main class="flex-1 p-6">
          <slot />
        </main>

        <!-- Footer -->
        <footer class="footer footer-center p-4 border-t border-base-300 text-base-content/50 text-sm">
          <p>&copy; {{ currentYear }} Sense of Jewels. Landing Page CMS.</p>
        </footer>
      </div>

      <!-- Sidebar -->
      <div class="drawer-side z-40">
        <label for="main-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <aside class="bg-primary text-primary-content min-h-full w-72 flex flex-col">
          <!-- Brand -->
          <div class="px-6 py-5 border-b border-white/10">
            <NuxtLink to="/admin" class="flex items-center gap-3">
              <div class="bg-secondary rounded-lg p-2">
                <IconDiamond class="w-6 h-6 text-secondary-content" />
              </div>
              <div>
                <h1 class="text-lg font-bold tracking-tight">Sense of Jewels</h1>
                <p class="text-xs text-primary-content/60">CMS</p>
              </div>
            </NuxtLink>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 px-3 py-4">
            <p class="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary-content/40">Overview</p>
            <ul class="flex flex-col gap-0.5">
              <li>
                <NuxtLink
                  to="/admin"
                  exact-active-class="bg-white/15 text-white font-semibold"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base text-primary-content/75 hover:bg-white/10 hover:text-white transition-colors w-full"
                >
                  <IconLayoutDashboard class="w-5 h-5 shrink-0" />
                  Dashboard
                </NuxtLink>
              </li>
            </ul>

            <p class="px-3 mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wider text-primary-content/40">Content</p>
            <ul class="flex flex-col gap-0.5">
              <li>
                <NuxtLink
                  to="/admin/sections"
                  active-class="bg-white/15 text-white font-semibold"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base text-primary-content/75 hover:bg-white/10 hover:text-white transition-colors w-full"
                >
                  <IconLayoutList class="w-5 h-5 shrink-0" />
                  Sections
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/admin/collections"
                  active-class="bg-white/15 text-white font-semibold"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base text-primary-content/75 hover:bg-white/10 hover:text-white transition-colors w-full"
                >
                  <IconCategory class="w-5 h-5 shrink-0" />
                  Collections
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/admin/products"
                  active-class="bg-white/15 text-white font-semibold"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base text-primary-content/75 hover:bg-white/10 hover:text-white transition-colors w-full"
                >
                  <IconDiamond class="w-5 h-5 shrink-0" />
                  Products
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/admin/testimonials"
                  active-class="bg-white/15 text-white font-semibold"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base text-primary-content/75 hover:bg-white/10 hover:text-white transition-colors w-full"
                >
                  <IconQuote class="w-5 h-5 shrink-0" />
                  Testimonials
                </NuxtLink>
              </li>
            </ul>

            <p class="px-3 mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wider text-primary-content/40">Assets</p>
            <ul class="flex flex-col gap-0.5">
              <li>
                <!-- Shop (feature-gated) -->
                <NuxtLink
                  v-if="plan.hasFeature('shop')"
                  to="/shop"
                  target="_blank"
                  active-class="bg-white/15 text-white font-semibold"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base text-primary-content/75 hover:bg-white/10 hover:text-white transition-colors w-full"
                >
                  <IconShoppingBag class="w-5 h-5 shrink-0" />
                  Shop Page
                </NuxtLink>
                <div v-else class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base text-primary-content/30 cursor-not-allowed select-none">
                  <IconShoppingBag class="w-5 h-5 shrink-0" />
                  <span class="flex-1">Shop Page</span>
                  <IconLock class="w-3.5 h-3.5 shrink-0" />
                </div>
              </li>
              <li>
                <NuxtLink
                  to="/admin/media"
                  active-class="bg-white/15 text-white font-semibold"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base text-primary-content/75 hover:bg-white/10 hover:text-white transition-colors w-full"
                >
                  <IconPhoto class="w-5 h-5 shrink-0" />
                  Media
                </NuxtLink>
              </li>
              <li v-if="auth.isSuperAdmin.value">
                <NuxtLink
                  to="/admin/users"
                  active-class="bg-white/15 text-white font-semibold"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base text-primary-content/75 hover:bg-white/10 hover:text-white transition-colors w-full"
                >
                  <IconUsers class="w-5 h-5 shrink-0" />
                  Users
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/admin/settings"
                  active-class="bg-white/15 text-white font-semibold"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base text-primary-content/75 hover:bg-white/10 hover:text-white transition-colors w-full"
                >
                  <IconSettings class="w-5 h-5 shrink-0" />
                  Settings
                </NuxtLink>
              </li>
            </ul>
          </nav>

          <!-- Sidebar Footer -->
          <div class="px-4 py-4 border-t border-white/10">
            <div class="flex items-center gap-3 px-2">
              <div class="bg-secondary/20 rounded-full p-2">
                <IconUser class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ auth.user.value?.name || 'Admin' }}</p>
                <p class="text-xs text-primary-content/50 truncate">{{ auth.user.value?.email || '' }}</p>
              </div>
              <button @click="auth.logout()" class="btn btn-ghost btn-xs btn-circle text-primary-content/50 hover:text-white hover:bg-white/10" title="Logout">
                <IconLogout class="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IconDiamond,
  IconLayoutDashboard,
  IconLayoutList,
  IconCategory,
  IconQuote,
  IconPhoto,
  IconMenu2,
  IconUser,
  IconSettings,
  IconLogout,
  IconLock,
  IconShoppingBag,
  IconUsers,
} from '@tabler/icons-vue'

const { data: themeSettings } = await useFetch<Record<string, string>>('/api/settings')
useTheme(themeSettings)

const route = useRoute()
const auth = useAuth()
const plan = usePlan()
const currentYear = new Date().getFullYear()

onMounted(() => auth.fetchUser())

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/sections': 'Sections',
    '/admin/collections': 'Collections',
    '/admin/products': 'Products',
    '/admin/testimonials': 'Testimonials',
    '/admin/media': 'Media',
    '/admin/settings': 'Settings',
    '/admin/users': 'Users',
  }
  return titles[route.path] || 'Page'
})
</script>
