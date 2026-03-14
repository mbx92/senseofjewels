<template>
  <div>
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-base-content">Testimonials</h1>
        <p class="text-sm text-base-content/50 mt-1">Manage customer testimonials</p>
      </div>
      <div class="mt-3 sm:mt-0">
        <button class="btn btn-primary btn-sm" @click="openCreate()">
          <IconPlus class="w-4 h-4" /> Add Testimonial
        </button>
      </div>
    </div>

    <!-- Testimonials Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="t in testimonials"
        :key="t.id"
        class="card bg-base-100 border border-base-300 hover:border-base-content/20 hover:shadow-md cursor-pointer"
        @click="openEdit(t)"
      >
        <div class="card-body p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center overflow-hidden shrink-0">
              <img v-if="t.avatar" :src="t.avatar" :alt="t.name" class="w-full h-full object-cover" />
              <IconUser v-else class="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p class="text-sm font-semibold">{{ t.name }}</p>
              <p class="text-xs text-base-content/40">{{ t.role || '-' }}</p>
            </div>
          </div>
          <p class="text-sm text-base-content/70 line-clamp-3">{{ t.content }}</p>
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-base-200">
            <div class="flex gap-0.5">
              <IconStar v-for="i in 5" :key="i" class="w-3.5 h-3.5" :class="i <= t.rating ? 'text-warning fill-warning' : 'text-base-300'" />
            </div>
            <span class="badge badge-soft badge-sm" :class="t.isActive ? 'badge-success' : 'badge-error'">
              {{ t.isActive ? 'Active' : 'Draft' }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="(testimonials || []).length === 0" class="col-span-full">
        <div class="card bg-base-100 border border-base-300 border-dashed">
          <div class="card-body items-center text-center py-12">
            <div class="bg-base-200 rounded-full p-4 mb-3">
              <IconQuote class="w-8 h-8 text-base-content/30" />
            </div>
            <p class="font-medium text-base-content/60">No testimonials yet</p>
            <button class="btn btn-primary btn-sm mt-3" @click="openCreate()">
              <IconPlus class="w-4 h-4" /> Add Testimonial
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
        <h3 class="font-bold text-lg mb-4">{{ editing ? 'Edit Testimonial' : 'Add Testimonial' }}</h3>

        <form @submit.prevent="save()">
          <div class="grid grid-cols-2 gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Name</legend>
              <input v-model="form.name" type="text" class="input w-full" required />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Role / Title</legend>
              <input v-model="form.role" type="text" class="input w-full" />
            </fieldset>
          </div>

          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Content</legend>
            <textarea v-model="form.content" class="textarea w-full" rows="4" required></textarea>
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Avatar</legend>
            <div v-if="form.avatar" class="mb-2 flex items-center gap-3">
              <img :src="form.avatar" class="w-12 h-12 rounded-full object-cover border border-base-300" />
              <button type="button" class="btn btn-xs btn-ghost text-error" @click="form.avatar = ''">Remove</button>
            </div>
            <div class="flex gap-2">
              <input v-model="form.avatar" type="text" class="input input-sm flex-1 font-mono" placeholder="Paste URL or pick from media..." />
              <button type="button" class="btn btn-sm btn-outline shrink-0" @click="pickerOpen = true">
                <IconPhoto class="w-4 h-4" />
              </button>
            </div>
          </fieldset>

          <MediaPickerModal :open="pickerOpen" :selected="form.avatar" @close="pickerOpen = false" @pick="url => form.avatar = url" />

          <div class="grid grid-cols-3 gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Rating (1-5)</legend>
              <input v-model.number="form.rating" type="number" min="1" max="5" class="input w-full" />
            </fieldset>
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
import { IconPlus, IconX, IconUser, IconStar, IconQuote, IconPhoto } from '@tabler/icons-vue'
import type { Testimonial } from '~/types'

const pickerOpen = ref(false)

const { data: testimonials, refresh } = await useFetch<Testimonial[]>('/api/testimonials')

const modalRef = ref<HTMLDialogElement>()
const editing = ref<string | null>(null)
const saving = ref(false)

const defaultForm = () => ({
  name: '',
  role: '',
  content: '',
  avatar: '',
  rating: 5,
  sortOrder: 0,
  isActive: true,
})
const form = ref(defaultForm())

function openCreate() {
  editing.value = null
  form.value = defaultForm()
  modalRef.value?.showModal()
}

function openEdit(t: Testimonial) {
  editing.value = t.id
  form.value = {
    name: t.name,
    role: t.role || '',
    content: t.content,
    avatar: t.avatar || '',
    rating: t.rating,
    sortOrder: t.sortOrder,
    isActive: t.isActive,
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
      await $fetch(`/api/testimonials/${editing.value}`, { method: 'PUT', body: form.value })
    } else {
      await $fetch('/api/testimonials', { method: 'POST', body: form.value })
    }
    closeModal()
    await refresh()
  } finally {
    saving.value = false
  }
}

async function remove(id: string) {
  if (!confirm('Delete this testimonial?')) return
  await $fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
  closeModal()
  await refresh()
}
</script>
