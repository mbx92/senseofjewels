<template>
  <div>
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-base-content">Sections</h1>
        <p class="text-sm text-base-content/50 mt-1">Manage landing page sections</p>
      </div>
      <div class="mt-3 sm:mt-0">
        <button class="btn btn-primary btn-sm" @click="openCreate()">
          <IconPlus class="w-4 h-4" /> Add Section
        </button>
      </div>
    </div>

    <!-- Sections Table -->
    <div class="card bg-base-100 border border-base-300">
      <div class="card-body p-0">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr class="text-xs uppercase text-base-content/40">
                <th>Order</th>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in sections" :key="s.id" class="hover">
                <td class="text-sm font-mono w-16">{{ s.sortOrder }}</td>
                <td class="text-sm font-medium">{{ s.title }}</td>
                <td class="text-sm text-base-content/50 font-mono">{{ s.slug }}</td>
                <td>
                  <span class="badge badge-soft badge-sm" :class="s.isActive ? 'badge-success' : 'badge-error'">
                    {{ s.isActive ? 'Active' : 'Draft' }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="btn btn-ghost btn-xs" @click="openEdit(s)"><IconEdit class="w-4 h-4" /></button>
                  <button class="btn btn-ghost btn-xs text-error" @click="remove(s.id)"><IconTrash class="w-4 h-4" /></button>
                </td>
              </tr>
              <tr v-if="(sections || []).length === 0">
                <td colspan="5" class="text-center py-10">
                  <div class="flex flex-col items-center text-base-content/30">
                    <IconLayoutList class="w-10 h-10 mb-2" />
                    <p class="text-sm">No sections yet</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <dialog ref="modalRef" class="modal">
      <div class="modal-box max-w-lg">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3" @click="closeModal()">
          <IconX class="w-4 h-4" />
        </button>
        <h3 class="font-bold text-lg mb-4">{{ editing ? 'Edit Section' : 'Add Section' }}</h3>

        <form @submit.prevent="save()">
          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Title</legend>
            <input v-model="form.title" type="text" class="input w-full" required />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Slug</legend>
            <input v-model="form.slug" type="text" class="input w-full" required />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Subtitle</legend>
            <input v-model="form.subtitle" type="text" class="input w-full" />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Body</legend>
            <textarea v-model="form.body" class="textarea w-full" rows="4"></textarea>
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
import { IconPlus, IconEdit, IconTrash, IconX, IconLayoutList, IconPhoto } from '@tabler/icons-vue'
import type { Section } from '~/types'

const pickerOpen = ref(false)

const { data: sections, refresh } = await useFetch<Section[]>('/api/sections')

const modalRef = ref<HTMLDialogElement>()
const editing = ref<string | null>(null)
const saving = ref(false)

const defaultForm = () => ({
  title: '',
  slug: '',
  subtitle: '',
  body: '',
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

function openEdit(s: Section) {
  editing.value = s.id
  form.value = {
    title: s.title,
    slug: s.slug,
    subtitle: s.subtitle || '',
    body: s.body || '',
    image: s.image || '',
    sortOrder: s.sortOrder,
    isActive: s.isActive,
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
      await $fetch(`/api/sections/${editing.value}`, { method: 'PUT', body: form.value })
    } else {
      await $fetch('/api/sections', { method: 'POST', body: form.value })
    }
    closeModal()
    await refresh()
  } finally {
    saving.value = false
  }
}

async function remove(id: string) {
  if (!confirm('Delete this section?')) return
  await $fetch(`/api/sections/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>
