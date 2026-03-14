<template>
  <div
    @dragenter.prevent="dragOver = true"
    @dragover.prevent="dragOver = true"
    @dragleave.self="dragOver = false"
    @drop.prevent="onDrop"
  >
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-base-content">Media</h1>
        <p class="text-sm text-base-content/50 mt-1">Upload and manage images</p>
      </div>
      <div class="mt-3 sm:mt-0 flex gap-2">
        <button class="btn btn-ghost btn-sm" @click="openNewFolder">
          <IconFolderPlus class="w-4 h-4" /> New Folder
        </button>
        <label class="btn btn-primary btn-sm">
          <IconUpload class="w-4 h-4" /> Upload
          <input type="file" class="hidden" accept="image/*" multiple @change="handleUpload" />
        </label>
      </div>
    </div>

    <!-- Dropzone -->
    <label
      class="relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl mb-5 cursor-pointer transition-all"
      :class="dragOver ? 'border-primary bg-primary/5 py-10' : 'border-base-300 bg-base-100 py-6 hover:border-primary/40 hover:bg-base-200/50'"
      @dragenter.prevent="dragOver = true"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
    >
      <input type="file" class="hidden" accept="image/*" multiple @change="handleUpload" />
      <div class="flex flex-col items-center gap-2 pointer-events-none">
        <div class="rounded-full p-3" :class="dragOver ? 'bg-primary/10' : 'bg-base-200'">
          <IconCloudUpload class="w-7 h-7" :class="dragOver ? 'text-primary' : 'text-base-content/30'" />
        </div>
        <p class="text-sm font-medium" :class="dragOver ? 'text-primary' : 'text-base-content/60'">
          {{ dragOver ? 'Drop to upload' : 'Drag & drop images here' }}
        </p>
        <p v-if="!dragOver" class="text-xs text-base-content/40">or click to browse · PNG, JPG, WebP, GIF, SVG · max 5MB each</p>
      </div>
      <div v-if="uploadFolder && !dragOver" class="absolute top-2 right-3 text-xs text-base-content/40 flex items-center gap-1">
        <IconFolder class="w-3 h-3" /> {{ uploadFolder }}
      </div>
    </label>

    <!-- Upload Queue -->
    <div v-if="queue.length" class="mb-5 card bg-base-100 border border-base-300">
      <div class="card-body p-4">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-base-content/50">
            Uploading {{ queueDone }}/{{ queue.length }} files
          </p>
          <button v-if="queueDone === queue.length" class="btn btn-xs btn-ghost" @click="queue = []">Clear</button>
        </div>
        <div class="space-y-2">
          <div v-for="item in queue" :key="item.name" class="flex items-center gap-3 text-sm">
            <div class="flex-1 min-w-0">
              <p class="truncate text-xs font-medium">{{ item.name }}</p>
              <div class="mt-1 h-1 bg-base-300 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="item.status === 'error' ? 'bg-error' : item.status === 'done' ? 'bg-success' : 'bg-primary'"
                  :style="{ width: item.status === 'done' ? '100%' : item.status === 'error' ? '100%' : item.status === 'uploading' ? '60%' : '0%' }"
                />
              </div>
            </div>
            <span class="badge badge-xs shrink-0"
              :class="item.status === 'done' ? 'badge-success' : item.status === 'error' ? 'badge-error' : item.status === 'uploading' ? 'badge-info' : 'badge-ghost'">
              {{ item.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Folder Tabs -->
    <div class="flex flex-wrap gap-2 mb-5">
      <button
        class="btn btn-sm"
        :class="activeFolder === '' ? 'btn-primary' : 'btn-ghost'"
        @click="setFolder('')"
      >
        <IconPhoto class="w-4 h-4" /> All
        <span class="badge badge-sm ml-1">{{ totalCount }}</span>
      </button>
      <button
        class="btn btn-sm"
        :class="activeFolder === 'uncategorized' ? 'btn-primary' : 'btn-ghost'"
        @click="setFolder('uncategorized')"
      >
        <IconInbox class="w-4 h-4" /> Uncategorized
      </button>
      <button
        v-for="f in folders"
        :key="f"
        class="btn btn-sm"
        :class="activeFolder === f ? 'btn-primary' : 'btn-ghost'"
        @click="setFolder(f)"
      >
        <IconFolder class="w-4 h-4" /> {{ f }}
      </button>
    </div>

    <!-- Upload to folder selector (shown when a folder is active) -->
    <div v-if="activeFolder && activeFolder !== 'uncategorized'" class="mb-4 p-3 bg-base-200 rounded-lg flex items-center gap-2 text-sm">
      <IconFolder class="w-4 h-4 text-secondary shrink-0" />
      <span>Uploads will go to <strong>{{ activeFolder }}</strong></span>
    </div>

    <!-- Media Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div
        v-for="m in media"
        :key="m.id"
        class="group relative bg-base-100 border border-base-300 rounded-lg overflow-hidden hover:border-secondary/40 hover:shadow-md cursor-pointer aspect-square"
        @click="openDetail(m)"
      >
        <img :src="m.url" :alt="m.alt || m.filename" class="w-full h-full object-contain p-1" />
        <!-- Folder badge -->
        <div v-if="m.folder && activeFolder === ''" class="absolute top-1 left-1">
          <span class="badge badge-xs bg-secondary/80 text-secondary-content border-0 truncate max-w-20">{{ m.folder }}</span>
        </div>
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2">
          <button
            class="btn btn-sm btn-circle btn-ghost bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy URL"
            @click.stop="copyUrl(m.url)"
          >
            <IconCopy class="w-4 h-4" />
          </button>
          <button
            class="btn btn-sm btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
            @click.stop="remove(m.id)"
          >
            <IconTrash class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div v-if="(media || []).length === 0" class="col-span-full">
        <div class="card bg-base-100 border border-base-300 border-dashed">
          <div class="card-body items-center text-center py-12">
            <div class="bg-base-200 rounded-full p-4 mb-3">
              <IconPhoto class="w-8 h-8 text-base-content/30" />
            </div>
            <p class="font-medium text-base-content/60">No media{{ activeFolder ? ` in "${activeFolder === 'uncategorized' ? 'Uncategorized' : activeFolder}"` : '' }}</p>
            <label class="btn btn-primary btn-sm mt-3">
              <IconUpload class="w-4 h-4" /> Upload Files
              <input type="file" class="hidden" accept="image/*" multiple @change="handleUpload" />
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Copy success toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="copied" class="toast toast-top toast-center z-50">
          <div class="alert alert-success text-sm py-2">
            <IconCheck class="w-4 h-4" />
            <span>URL copied!</span>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Detail Modal -->
    <dialog class="modal" :open="!!selected">
      <div class="modal-box max-w-lg" v-if="selected">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3" @click="selected = null">
          <IconX class="w-4 h-4" />
        </button>
        <h3 class="font-bold text-lg mb-4">Media Details</h3>
        <img :src="selected.url" :alt="selected.alt || selected.filename" class="w-full rounded mb-4" />
        <div class="space-y-3 text-sm">
          <p><span class="font-semibold">Filename:</span> {{ selected.filename }}</p>
          <div>
            <p class="font-semibold mb-1">URL</p>
            <div class="flex items-center gap-2">
              <code class="flex-1 text-xs bg-base-200 px-2 py-1.5 rounded truncate">{{ selected.url }}</code>
              <button class="btn btn-sm btn-secondary" @click="copyUrl(selected!.url)">
                <IconCopy class="w-4 h-4" /> Copy
              </button>
            </div>
          </div>
          <div>
            <p class="font-semibold mb-1">Folder</p>
            <div class="flex gap-2">
              <select v-model="editFolder" class="select select-sm select-bordered flex-1">
                <option value="">Uncategorized</option>
                <option v-for="f in folders" :key="f" :value="f">{{ f }}</option>
                <option value="__new__">+ New folder...</option>
              </select>
              <button class="btn btn-sm btn-primary" @click="saveFolder">Save</button>
            </div>
            <input
              v-if="editFolder === '__new__'"
              v-model="newFolderInline"
              class="input input-sm input-bordered w-full mt-2"
              placeholder="Folder name..."
              @keyup.enter="saveFolder"
            />
          </div>
          <p><span class="font-semibold">Size:</span> {{ (selected.size / 1024).toFixed(1) }} KB</p>
          <p><span class="font-semibold">Type:</span> {{ selected.mimeType }}</p>
        </div>
        <div class="modal-action">
          <button class="btn btn-error btn-sm" @click="remove(selected!.id); selected = null">Delete</button>
          <button class="btn btn-ghost btn-sm" @click="selected = null">Close</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="selected = null"><button>close</button></form>
    </dialog>

    <!-- New Folder Modal -->
    <dialog class="modal" :open="showNewFolder">
      <div class="modal-box max-w-sm">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3" @click="showNewFolder = false">
          <IconX class="w-4 h-4" />
        </button>
        <h3 class="font-bold text-lg mb-4">Create Folder</h3>
        <fieldset class="fieldset">
          <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Folder Name</legend>
          <input
            v-model="newFolderName"
            class="input input-bordered w-full"
            placeholder="e.g. Products, Landing, Hero..."
            @keyup.enter="createFolder"
          />
        </fieldset>
        <div class="modal-action">
          <button class="btn btn-primary btn-sm" :disabled="!newFolderName.trim()" @click="createFolder">Create</button>
          <button class="btn btn-ghost btn-sm" @click="showNewFolder = false">Cancel</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="showNewFolder = false"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { IconUpload, IconTrash, IconPhoto, IconX, IconFolder, IconFolderPlus, IconInbox, IconCopy, IconCheck, IconCloudUpload } from '@tabler/icons-vue'
import type { Media } from '~/types'

interface MediaResponse {
  media: Media[]
  folders: string[]
}

interface QueueItem { name: string; status: 'pending' | 'uploading' | 'done' | 'error' }

const activeFolder = ref('')
const uploading = ref(false)
const dragOver = ref(false)
const queue = ref<QueueItem[]>([])
const queueDone = computed(() => queue.value.filter(i => i.status === 'done' || i.status === 'error').length)
const selected = ref<Media | null>(null)
const editFolder = ref('')
const newFolderInline = ref('')
const showNewFolder = ref(false)
const newFolderName = ref('')
const copied = ref(false)

const url = computed(() => {
  const params = activeFolder.value ? `?folder=${activeFolder.value}` : ''
  return `/api/media${params}`
})

const { data, refresh } = await useFetch<MediaResponse>(url)

const media = computed(() => data.value?.media ?? [])
const folders = computed(() => data.value?.folders ?? [])
const totalCount = computed(() => {
  // Show total from "All" — do a separate count or re-fetch without filter for total
  return media.value.length
})
const uploadFolder = computed(() => (activeFolder.value && activeFolder.value !== 'uncategorized') ? activeFolder.value : null)

async function setFolder(f: string) {
  activeFolder.value = f
  await refresh()
}

function openDetail(m: Media) {
  selected.value = m
  editFolder.value = m.folder ?? ''
  newFolderInline.value = ''
}

async function copyUrl(urlStr: string) {
  try {
    await navigator.clipboard.writeText(window.location.origin + urlStr)
  } catch {
    // fallback for older browsers
    const el = document.createElement('textarea')
    el.value = window.location.origin + urlStr
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

async function saveFolder() {
  if (!selected.value) return
  const folder = editFolder.value === '__new__'
    ? newFolderInline.value.trim()
    : editFolder.value.trim()
  await $fetch(`/api/media/${selected.value.id}`, {
    method: 'PUT',
    body: { alt: selected.value.alt, folder: folder || null },
  })
  selected.value = { ...selected.value, folder: folder || null }
  await refresh()
}

function openNewFolder() {
  newFolderName.value = ''
  showNewFolder.value = true
}

async function createFolder() {
  const name = newFolderName.value.trim()
  if (!name) return
  showNewFolder.value = false
  // Navigate to new folder tab — it'll appear once media is uploaded there
  activeFolder.value = name
  await refresh()
}

async function handleUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files?.length) return
  await uploadFiles(Array.from(files))
  input.value = ''
}

async function onDrop(e: DragEvent) {
  dragOver.value = false
  const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'))
  if (!files.length) return
  await uploadFiles(files)
}

async function uploadFiles(files: File[]) {
  const items: QueueItem[] = files.map(f => ({ name: f.name, status: 'pending' }))
  queue.value.push(...items)
  uploading.value = true
  const offset = queue.value.length - items.length
  try {
    for (let i = 0; i < files.length; i++) {
      queue.value[offset + i].status = 'uploading'
      try {
        const fd = new FormData()
        fd.append('file', files[i])
        if (uploadFolder.value) fd.append('folder', uploadFolder.value)
        await $fetch('/api/media/upload', { method: 'POST', body: fd })
        queue.value[offset + i].status = 'done'
      } catch {
        queue.value[offset + i].status = 'error'
      }
    }
    await refresh()
  } finally {
    uploading.value = false
  }
}

async function remove(id: string) {
  if (!confirm('Delete this file?')) return
  await $fetch(`/api/media/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
