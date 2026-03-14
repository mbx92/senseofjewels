<template>
  <div>
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-base-content">Dashboard</h1>
        <p class="text-sm text-base-content/50 mt-1">Landing page content overview</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="card bg-base-100 border border-base-300">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-base-content/40">Sections</p>
              <p class="text-2xl font-bold mt-1">{{ sections?.length || 0 }}</p>
            </div>
            <div class="bg-primary/10 rounded-lg p-3">
              <IconLayoutList class="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 border border-base-300">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-base-content/40">Collections</p>
              <p class="text-2xl font-bold mt-1">{{ collections?.length || 0 }}</p>
            </div>
            <div class="bg-secondary/10 rounded-lg p-3">
              <IconCategory class="w-5 h-5 text-secondary" />
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 border border-base-300">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-base-content/40">Products</p>
              <p class="text-2xl font-bold mt-1">{{ products?.length || 0 }}</p>
            </div>
            <div class="bg-accent/10 rounded-lg p-3">
              <IconDiamond class="w-5 h-5 text-accent" />
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-primary text-primary-content">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-primary-content/60">Testimonials</p>
              <p class="text-2xl font-bold mt-1">{{ testimonials?.length || 0 }}</p>
            </div>
            <div class="bg-white/15 rounded-lg p-3">
              <IconQuote class="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Products -->
      <div class="lg:col-span-2">
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body p-0">
            <div class="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 class="font-semibold text-base-content">Recent Products</h2>
              <NuxtLink to="/admin/products" class="btn btn-ghost btn-xs text-primary">View All</NuxtLink>
            </div>
            <div class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr class="text-xs uppercase text-base-content/40">
                    <th>Product</th>
                    <th>Collection</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in recentProducts" :key="p.id" class="hover">
                    <td>
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-base-200 rounded overflow-hidden shrink-0">
                          <img v-if="p.image" :src="p.image" :alt="p.name" class="w-full h-full object-cover" />
                          <div v-else class="w-full h-full flex items-center justify-center">
                            <IconDiamond class="w-4 h-4 text-base-content/20" />
                          </div>
                        </div>
                        <span class="text-sm font-medium">{{ p.name }}</span>
                      </div>
                    </td>
                    <td><span class="badge badge-soft badge-sm">{{ p.collection?.name || '-' }}</span></td>
                    <td class="text-sm font-mono">{{ formatCurrency(p.price) }}</td>
                    <td>
                      <span class="badge badge-soft badge-sm" :class="p.isActive ? 'badge-success' : 'badge-error'">
                        {{ p.isActive ? 'Active' : 'Draft' }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="recentProducts.length === 0">
                    <td colspan="4" class="text-center py-10">
                      <div class="flex flex-col items-center text-base-content/30">
                        <IconDiamond class="w-10 h-10 mb-2" />
                        <p class="text-sm">No products yet</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Collections Sidebar -->
      <div>
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body p-0">
            <div class="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 class="font-semibold text-base-content">Collections</h2>
              <NuxtLink to="/admin/collections" class="btn btn-ghost btn-xs text-primary">Manage</NuxtLink>
            </div>
            <div class="divide-y divide-base-200">
              <div v-for="col in (collections || [])" :key="col.id" class="flex items-center justify-between px-5 py-3">
                <div class="flex items-center gap-3 overflow-hidden pr-4">
                  <div class="bg-secondary/10 rounded-lg p-2 shrink-0">
                    <IconCategory class="w-4 h-4 text-secondary" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium truncate">{{ col.name }}</p>
                    <p class="text-xs text-base-content/40">{{ col._count?.products || 0 }} products</p>
                  </div>
                </div>
                <span class="badge badge-soft badge-sm" :class="col.isActive ? 'badge-success' : 'badge-error'">
                  {{ col.isActive ? 'Active' : 'Draft' }}
                </span>
              </div>
              <div v-if="(collections || []).length === 0" class="px-5 py-8 text-center">
                <div class="flex flex-col items-center text-base-content/30">
                  <IconCategory class="w-8 h-8 mb-2" />
                  <p class="text-sm">No collections yet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IconLayoutList,
  IconCategory,
  IconDiamond,
  IconQuote,
} from '@tabler/icons-vue'
import type { Section, Collection, Product, Testimonial } from '~/types'

const { data: sections } = await useFetch<Section[]>('/api/sections')
const { data: collections } = await useFetch<Collection[]>('/api/collections')
const { data: products } = await useFetch<Product[]>('/api/products')
const { data: testimonials } = await useFetch<Testimonial[]>('/api/testimonials')

const recentProducts = computed(() => (products.value || []).slice(0, 5))

const { formatCurrency } = useFormatCurrency()
</script>
