<template>
  <dialog class="modal" :open="open">
    <div class="modal-box max-w-4xl">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3" @click="$emit('close')">
        <IconX class="w-4 h-4" />
      </button>
      <h3 class="font-bold text-lg mb-1">Select Image</h3>
      <p class="text-xs text-base-content/40 mb-4">Click an image to {{ multiple ? 'add to gallery' : 'select' }}</p>

      <!-- Folder filter -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="f in ['', ...folders]"
          :key="f"
          class="btn btn-xs"
          :class="filterFolder === f ? 'btn-primary' : 'btn-ghost'"
          @click="filterFolder = f"
        >
          {{ f === '' ? 'All' : f }}
        </button>
      </div>

      <div v-if="!filteredMedia.length" class="text-center py-12 text-base-content/40 text-sm">
        No images found. Upload via the Media page first.
      </div>
      <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-96 overflow-y-auto pr-1">
        <button
          v-for="m in filteredMedia"
          :key="m.id"
          type="button"
          class="relative group aspect-square bg-base-200 rounded-lg overflow-hidden border-2 hover:border-primary transition-colors"
          :class="isSelected(m.url) ? 'border-primary' : 'border-transparent'"
          @click="pick(m.url)"
        >
          <img :src="m.url" :alt="m.filename" class="w-full h-full object-contain p-1" />
          <div v-if="isSelected(m.url)" class="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <IconCheck class="w-5 h-5 text-primary" />
          </div>
        </button>
      </div>

      <div class="modal-action">
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">Cancel</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="$emit('close')"><button>close</button></form>
  </dialog>
</template>

<script setup lang="ts">
import { IconX, IconCheck } from '@tabler/icons-vue'
import type { Media } from '~/types'

interface MediaResponse { media: Media[]; folders: string[] }

const props = defineProps<{
  open: boolean
  multiple?: boolean
  selected?: string | string[]
}>()

const emit = defineEmits<{
  close: []
  pick: [url: string]
}>()

const filterFolder = ref('')
const { data } = await useFetch<MediaResponse>('/api/media')

const folders = computed(() => data.value?.folders ?? [])
const allMedia = computed(() => data.value?.media ?? [])
const filteredMedia = computed(() =>
  filterFolder.value
    ? allMedia.value.filter(m => m.folder === filterFolder.value)
    : allMedia.value
)

// Re-fetch when modal opens
watch(() => props.open, async (val) => {
  if (val) await refreshNuxtData('/api/media')
})

function isSelected(url: string) {
  if (!props.selected) return false
  if (Array.isArray(props.selected)) return props.selected.includes(url)
  return props.selected === url
}

function pick(url: string) {
  emit('pick', url)
  if (!props.multiple) emit('close')
}
</script>
