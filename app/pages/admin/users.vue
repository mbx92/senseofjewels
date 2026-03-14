<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
      <div>
        <h1 class="text-2xl font-bold text-base-content">Users</h1>
        <p class="text-sm text-base-content/50 mt-1">Manage CMS admin accounts</p>
      </div>
      <button class="btn btn-primary btn-sm" @click="openCreate">
        <IconPlus class="w-4 h-4" /> Add User
      </button>
    </div>

    <!-- Table -->
    <div class="card bg-base-100 border border-base-300">
      <div class="card-body p-0">
        <table class="table table-sm">
          <thead>
            <tr class="border-b border-base-300 text-xs uppercase tracking-wide text-base-content/40">
              <th class="pl-5">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th class="pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id" class="border-b border-base-200 last:border-0 hover:bg-base-200/40 transition-colors">
              <td class="pl-5">
                <div class="flex items-center gap-2">
                  <div class="bg-primary text-primary-content rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">
                    {{ u.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-medium text-base-content">{{ u.name }}</span>
                </div>
              </td>
              <td class="text-base-content/70 text-sm">{{ u.email }}</td>
              <td>
                <span class="badge badge-sm badge-soft"
                  :class="u.role === 'superadmin' ? 'badge-secondary' : 'badge-ghost'">
                  {{ u.role === 'superadmin' ? 'Superadmin' : 'Admin' }}
                </span>
              </td>
              <td class="text-base-content/50 text-xs">{{ formatDate(u.createdAt) }}</td>
              <td class="pr-5 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button class="btn btn-ghost btn-xs" @click="openEdit(u)">
                    <IconEdit class="w-4 h-4" />
                  </button>
                  <button class="btn btn-ghost btn-xs text-error" :disabled="u.id === currentUser?.id" @click="remove(u)">
                    <IconTrash class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!users?.length">
              <td colspan="5" class="text-center py-10 text-base-content/40">
                <IconUsers class="w-8 h-8 mx-auto mb-2 opacity-30" />
                No users yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <dialog ref="modalRef" class="modal">
      <div class="modal-box max-w-md">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3" @click="closeModal">
          <IconX class="w-4 h-4" />
        </button>
        <h3 class="font-bold text-lg mb-4">{{ editing ? 'Edit User' : 'Add User' }}</h3>

        <form @submit.prevent="save" class="flex flex-col gap-3">
          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Name</legend>
            <input v-model="form.name" type="text" class="input w-full" required />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Email</legend>
            <input v-model="form.email" type="email" class="input w-full" required />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">
              {{ editing ? 'New Password' : 'Password' }}
            </legend>
            <input v-model="form.password" type="password" class="input w-full" :required="!editing" :placeholder="editing ? 'Leave blank to keep current' : ''" autocomplete="new-password" />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">Role</legend>
            <select v-model="form.role" class="select w-full">
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
            <p class="label text-xs text-base-content/40">Superadmin can manage users and activate features</p>
          </fieldset>

          <div v-if="error" class="alert alert-error alert-sm text-sm py-2">{{ error }}</div>

          <div class="modal-action mt-0">
            <button type="button" class="btn btn-ghost btn-sm" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="saving">
              {{ saving ? 'Saving...' : editing ? 'Update User' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeModal"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { IconPlus, IconEdit, IconTrash, IconX, IconUsers } from '@tabler/icons-vue'
import type { User } from '~/types'

const auth = useAuth()
const currentUser = auth.user

const { data: users, refresh } = await useFetch<User[]>('/api/users')

const modalRef = ref<HTMLDialogElement>()
const editing = ref<string | null>(null)
const saving = ref(false)
const error = ref('')

const defaultForm = () => ({ name: '', email: '', password: '', role: 'admin' })
const form = ref(defaultForm())

function openCreate() {
  editing.value = null
  form.value = defaultForm()
  error.value = ''
  modalRef.value?.showModal()
}

function openEdit(u: User) {
  editing.value = u.id
  form.value = { name: u.name, email: u.email, password: '', role: u.role }
  error.value = ''
  modalRef.value?.showModal()
}

function closeModal() {
  modalRef.value?.close()
}

async function save() {
  saving.value = true
  error.value = ''
  try {
    if (editing.value) {
      const body: Record<string, string> = { name: form.value.name, email: form.value.email, role: form.value.role }
      if (form.value.password) body.password = form.value.password
      await $fetch(`/api/users/${editing.value}`, { method: 'PUT', body })
    } else {
      await $fetch('/api/users', { method: 'POST', body: form.value })
    }
    await refresh()
    closeModal()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'An error occurred'
  } finally {
    saving.value = false
  }
}

async function remove(u: User) {
  if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return
  try {
    await $fetch(`/api/users/${u.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Failed to delete user')
  }
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
