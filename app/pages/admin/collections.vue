<template>
  <div>
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-base-content">Collections</h1>
        <p class="text-sm text-base-content/50 mt-1">Manage jewelry collections (e.g. Necklaces, Earrings, Bracelets)</p>
      </div>
      <div class="mt-3 sm:mt-0">
        <button class="btn btn-primary btn-sm" @click="openCreate()">
          <IconPlus class="w-4 h-4" /> Add Collection
        </button>
      </div>
    </div>

    <!-- Collection Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="col in collections"
        :key="col.id"
        class="card bg-base-100 border border-base-300 group hover:border-base-content/20 hover:shadow-md cursor-pointer overflow-hidden relative"
        @click="openEdit(col)"
      >
        <figure v-if="col.image" class="h-40 bg-base-200">
          <img :src="col.image" :alt="col.name" class="w-full h-full object-cover" />
        </figure>
        <div v-else class="h-40 bg-base-200 flex items-center justify-center">
          <IconCategory class="w-12 h-12 text-base-content/10" />
        </div>
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-base-content">{{ col.name }}</h2>
            <span class="badge badge-soft badge-sm" :class="col.isActive ? 'badge-success' : 'badge-error'">
              {{ col.isActive ? 'Active' : 'Draft' }}
            </span>
          </div>
          <p class="text-sm text-base-content/50 line-clamp-2 mt-1">{{ col.description || 'No description' }}</p>
          <div class="mt-3 pt-3 border-t border-base-200 flex justify-between items-center">
            <span class="text-xs text-base-content/40">{{ col._count?.products || 0 }} products</span>
            <span class="text-xs font-mono text-base-content/40">/{{ col.slug }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="(collections || []).length === 0" class="col-span-full">
        <div class="card bg-base-100 border border-base-300 border-dashed">
          <div class="card-body items-center text-center py-12">
            <div class="bg-base-200 rounded-full p-4 mb-3">
              <IconCategory class="w-8 h-8 text-base-content/30" />
            </div>
            <p class="font-medium text-base-content/60">No collections yet</p>
            <p class="text-sm text-base-content/40">Add your first collection to organize products</p>
            <button class="btn btn-primary btn-sm mt-3" @click="openCreate()">
              <IconPlus class="w-4 h-4" /> Add Collection
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <dialog ref="modalRef" class="modal">
      <div class="modal-box max-w-lg">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3" @click="closeModal()">
          <IconX class="w-4 h-4" />
        </button>
        <h3 class="font-bold text-lg mb-4">{{ editing ? 'Edit Collection' : 'Add Collection' }}</h3>

        <form @submit.prevent="save()">
          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Name</legend>
            <input v-model="form.name" type="text" class="input w-full" required />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Slug</legend>
            <input v-model="form.slug" type="text" class="input w-full" required />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Description</legend>
            <textarea v-model="form.description" class="textarea w-full" rows="3"></textarea>
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Image</legend>
            <div v-if="form.image" class="mb-2 relative group w-full aspect-video rounded overflow-hidden bg-base-200">
              <img :src="form.image" class="w-full h-full object-cover" />
              <button type="button" class="absolute top-1 right-1 btn btn-xs btn-error opacity-0 group-hover:opacity-100" @click="form.image = ''">Remove</button>
            </div>
            <div class="flex gap-2">
              <input v-model="form.image" type="text" class="input input-sm flex-1 font-mono" placeholder="Paste URL or pick from media..." />
              <button type="button" class="btn btn-sm btn-outline shrink-0" @click="pickerOpen = true">
                <IconPhoto class="w-4 h-4" />
              </button>
            </div>
          </fieldset>

          <MediaPickerModal :open="pickerOpen" :selected="form.image" @close="pickerOpen = false" @pick="url => form.image = url" />

          <div class="grid grid-cols-2 gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Sort Order</legend>
              <input v-model.number="form.sortOrder" type="number" class="input w-full" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Active</legend>
              <input v-model="form.isActive" type="checkbox" class="toggle toggle-primary mt-2" />
            </fieldset>
          </div>

          <div class="modal-action">
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
import { IconPlus, IconX, IconCategory, IconPhoto } from '@tabler/icons-vue'
import type { Collection } from '~/types'

const pickerOpen = ref(false)

const { data: collections, refresh } = await useFetch<Collection[]>('/api/collections')

const modalRef = ref<HTMLDialogElement>()
const editing = ref<string | null>(null)
const saving = ref(false)

const defaultForm = () => ({
  name: '',
  slug: '',
  description: '',
  image: '',
  sortOrder: 0,
  isActive: true,
})
const form = ref(defaultForm())

function openCreate() {
  editing.value = null
  form.value = defaultForm()
  modalRef.value?.showModal()
}

function openEdit(col: Collection) {
  editing.value = col.id
  form.value = {
    name: col.name,
    slug: col.slug,
    description: col.description || '',
    image: col.image || '',
    sortOrder: col.sortOrder,
    isActive: col.isActive,
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
      await $fetch(`/api/collections/${editing.value}`, { method: 'PUT', body: form.value })
    } else {
      await $fetch('/api/collections', { method: 'POST', body: form.value })
    }
    closeModal()
    await refresh()
  } finally {
    saving.value = false
  }
}

async function remove(id: string) {
  if (!confirm('Delete this collection? All products inside will also be deleted.')) return
  await $fetch(`/api/collections/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>
