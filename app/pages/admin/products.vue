<template>
  <div>
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-base-content">Products</h1>
        <p class="text-sm text-base-content/50 mt-1">Manage jewelry products</p>
      </div>
      <div class="mt-3 sm:mt-0">
        <button class="btn btn-primary btn-sm" @click="openCreate()">
          <IconPlus class="w-4 h-4" /> Add Product
        </button>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex gap-3 mb-4">
      <select v-model="filterCollection" class="select select-sm w-48">
        <option value="">All Collections</option>
        <option v-for="c in collections" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <!-- Products Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="p in filteredProducts"
        :key="p.id"
        class="card bg-base-100 border border-base-300 group hover:border-base-content/20 hover:shadow-md cursor-pointer overflow-hidden"
        @click="openEdit(p)"
      >
        <figure class="h-48 bg-base-200 relative">
          <img v-if="p.image" :src="p.image" :alt="p.name" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <IconDiamond class="w-12 h-12 text-base-content/10" />
          </div>
          <div v-if="p.isFeatured" class="absolute top-2 left-2">
            <span class="badge badge-soft badge-warning badge-sm">Featured</span>
          </div>
        </figure>
        <div class="card-body p-4">
          <h2 class="font-semibold text-sm">{{ p.name }}</h2>
          <p class="text-xs text-base-content/40">{{ p.collection?.name || '-' }}</p>
          <div class="flex items-center justify-between mt-2">
            <span class="font-mono font-medium text-sm">{{ formatCurrency(p.price) }}</span>
            <span class="badge badge-soft badge-sm" :class="p.isActive ? 'badge-success' : 'badge-error'">
              {{ p.isActive ? 'Active' : 'Draft' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="filteredProducts.length === 0" class="col-span-full">
        <div class="card bg-base-100 border border-base-300 border-dashed">
          <div class="card-body items-center text-center py-12">
            <div class="bg-base-200 rounded-full p-4 mb-3">
              <IconDiamond class="w-8 h-8 text-base-content/30" />
            </div>
            <p class="font-medium text-base-content/60">No products yet</p>
            <button class="btn btn-primary btn-sm mt-3" @click="openCreate()">
              <IconPlus class="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <dialog ref="modalRef" class="modal">
      <div class="modal-box max-w-2xl">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3" @click="closeModal()">
          <IconX class="w-4 h-4" />
        </button>
        <h3 class="font-bold text-lg mb-4">{{ editing ? 'Edit Product' : 'Add Product' }}</h3>

        <form @submit.prevent="save()">
          <div class="grid grid-cols-2 gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Name</legend>
              <input v-model="form.name" type="text" class="input w-full" required />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Slug</legend>
              <input v-model="form.slug" type="text" class="input w-full" required />
            </fieldset>
          </div>

          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Description</legend>
            <textarea v-model="form.description" class="textarea w-full" rows="3"></textarea>
          </fieldset>

          <div class="grid grid-cols-2 gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Price (USD)</legend>
              <input v-model.number="form.price" type="number" step="0.01" class="input w-full" required />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Collection</legend>
              <select v-model="form.collectionId" class="select w-full" required>
                <option v-for="c in collections" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </fieldset>
          </div>

          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Main Image</legend>
            <div v-if="form.image" class="mb-2 relative group w-full aspect-video rounded overflow-hidden bg-base-200">
              <img :src="form.image" class="w-full h-full object-cover" />
              <button type="button" class="absolute top-1 right-1 btn btn-xs btn-error opacity-0 group-hover:opacity-100" @click="form.image = ''">Remove</button>
            </div>
            <div class="flex gap-2">
              <input v-model="form.image" type="text" class="input input-sm flex-1 font-mono" placeholder="Paste URL or pick from media..." />
              <button type="button" class="btn btn-sm btn-outline shrink-0" @click="pickerOpen = 'image'">
                <IconPhoto class="w-4 h-4" />
              </button>
            </div>
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Gallery</legend>
            <div v-if="form.gallery.length" class="grid grid-cols-4 gap-2 mb-2">
              <div v-for="(url, i) in form.gallery" :key="i" class="relative group aspect-square rounded overflow-hidden bg-base-200">
                <img :src="url" class="w-full h-full object-cover" />
                <button type="button" class="absolute top-0.5 right-0.5 btn btn-xs btn-circle btn-error opacity-0 group-hover:opacity-100" @click="form.gallery.splice(i, 1)">×</button>
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline w-full" @click="pickerOpen = 'gallery'">
              <IconPhoto class="w-4 h-4" /> Add from Media
            </button>
          </fieldset>

          <MediaPickerModal
            :open="pickerOpen === 'image'"
            :selected="form.image"
            @close="pickerOpen = null"
            @pick="url => form.image = url"
          />
          <MediaPickerModal
            :open="pickerOpen === 'gallery'"
            :multiple="true"
            :selected="form.gallery"
            @close="pickerOpen = null"
            @pick="url => { if (!form.gallery.includes(url)) form.gallery.push(url) }"
          />

          <div class="grid grid-cols-3 gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Sort Order</legend>
              <input v-model.number="form.sortOrder" type="number" class="input w-full" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Featured</legend>
              <input v-model="form.isFeatured" type="checkbox" class="toggle toggle-primary mt-2" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Active</legend>
              <input v-model="form.isActive" type="checkbox" class="toggle toggle-primary mt-2" />
            </fieldset>
          </div>

          <div class="modal-action">
            <button v-if="editing" type="button" class="btn btn-error btn-sm mr-auto" @click="remove(editing!)">Delete</button>
            <button type="button" class="btn btn-ghost btn-sm" @click="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeModal()"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { IconPlus, IconX, IconDiamond, IconPhoto } from '@tabler/icons-vue'
import type { Product, Collection } from '~/types'

const pickerOpen = ref<'image' | 'gallery' | null>(null)

const { data: products, refresh } = await useFetch<Product[]>('/api/products')
const { data: collections } = await useFetch<Collection[]>('/api/collections')

const { formatCurrency } = useFormatCurrency()
const filterCollection = ref('')

const filteredProducts = computed(() => {
  const list = products.value || []
  if (!filterCollection.value) return list
  return list.filter(p => p.collectionId === filterCollection.value)
})

const modalRef = ref<HTMLDialogElement>()
const editing = ref<string | null>(null)
const saving = ref(false)

const defaultForm = () => ({
  name: '',
  slug: '',
  description: '',
  price: 0,
  image: '',
  gallery: [] as string[],
  collectionId: '',
  isFeatured: false,
  isActive: true,
  sortOrder: 0,
})
const form = ref(defaultForm())

function openCreate() {
  editing.value = null
  form.value = defaultForm()
  if (collections.value?.length) form.value.collectionId = collections.value[0].id
  modalRef.value?.showModal()
}

function openEdit(p: Product) {
  editing.value = p.id
  form.value = {
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price: Number(p.price),
    image: p.image || '',
    gallery: p.gallery || [],
    collectionId: p.collectionId,
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    sortOrder: p.sortOrder,
  }
  modalRef.value?.showModal()
}

function closeModal() {
  modalRef.value?.close()
}

async function save() {
  saving.value = true
  try {
    if (editing.value) {
      await $fetch(`/api/products/${editing.value}`, { method: 'PUT', body: form.value })
    } else {
      await $fetch('/api/products', { method: 'POST', body: form.value })
    }
    closeModal()
    await refresh()
  } finally {
    saving.value = false
  }
}

async function remove(id: string) {
  if (!confirm('Delete this product?')) return
  await $fetch(`/api/products/${id}`, { method: 'DELETE' })
  closeModal()
  await refresh()
}
</script>
