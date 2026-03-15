<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
      <div>
        <h1 class="text-2xl font-bold text-base-content">Orders</h1>
        <p class="text-sm text-base-content/50 mt-1">Manage customer orders</p>
      </div>
      <!-- Status filter -->
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="s in STATUS_FILTERS"
          :key="s.value"
          @click="filterStatus = s.value"
          class="badge badge-sm cursor-pointer transition-all"
          :class="filterStatus === s.value ? 'badge-primary' : 'badge-ghost hover:badge-neutral'"
        >
          {{ s.label }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card bg-base-100 border border-base-300">
      <div class="card-body p-0">
        <table class="table table-sm">
          <thead>
            <tr class="border-b border-base-300 text-xs uppercase tracking-wide text-base-content/40">
              <th class="pl-5">Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th class="pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in filteredOrders"
              :key="order.id"
              class="border-b border-base-200 last:border-0 hover:bg-base-200/40 transition-colors cursor-pointer"
              @click="openDetail(order)"
            >
              <td class="pl-5">
                <span class="font-mono text-xs text-base-content/60">#{{ order.id.slice(-8).toUpperCase() }}</span>
              </td>
              <td>
                <div class="text-sm font-medium text-base-content">{{ order.shipName }}</div>
                <div class="text-xs text-base-content/50">{{ order.shipEmail }}</div>
              </td>
              <td class="text-sm text-base-content/70">{{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}</td>
              <td class="text-sm font-medium text-primary">{{ formatCurrency(order.subtotal) }}</td>
              <td>
                <span class="badge badge-sm badge-soft" :class="paymentBadge(order.paymentStatus)">
                  {{ PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus }}
                </span>
              </td>
              <td>
                <span class="badge badge-sm badge-soft" :class="statusBadge(order.status)">
                  {{ STATUS_LABELS[order.status] || order.status }}
                </span>
              </td>
              <td class="text-xs text-base-content/50">{{ formatDate(order.createdAt) }}</td>
              <td class="pr-5 text-right">
                <button class="btn btn-ghost btn-xs" @click.stop="openDetail(order)">
                  <IconEye class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="!filteredOrders.length">
              <td colspan="8" class="text-center py-12 text-base-content/40">
                <IconShoppingBag class="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No orders yet</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <dialog ref="modalRef" class="modal">
      <div v-if="selected" class="modal-box max-w-2xl">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3" @click="closeModal">
          <IconX class="w-4 h-4" />
        </button>
        <h3 class="font-bold text-lg mb-1">Order Detail</h3>
        <p class="text-xs text-base-content/40 font-mono mb-6">#{{ selected.id.slice(-8).toUpperCase() }} · {{ formatDate(selected.createdAt) }}</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Shipping info -->
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-base-content/40 mb-2">Shipping Details</p>
            <div class="space-y-1 text-sm">
              <p class="font-medium text-base-content">{{ selected.shipName }}</p>
              <p class="text-base-content/60">{{ selected.shipPhone }}</p>
              <p class="text-base-content/60">{{ selected.shipEmail }}</p>
              <p class="text-base-content/60 mt-1">{{ selected.shipAddress }}<br />{{ selected.shipCity }}, {{ selected.shipProvince }} {{ selected.shipPostal }}</p>
              <p v-if="selected.shipNotes" class="text-base-content/50 italic text-xs mt-1">{{ selected.shipNotes }}</p>
            </div>
          </div>

          <!-- Order items -->
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-base-content/40 mb-2">Items</p>
            <div class="space-y-2">
              <div v-for="item in selected.items" :key="item.id" class="flex items-center gap-2">
                <div class="w-10 h-10 bg-base-200 rounded shrink-0 overflow-hidden">
                  <img v-if="item.productImage" :src="item.productImage" class="w-full h-full object-contain p-0.5" />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <IconDiamond class="w-4 h-4 text-base-content/20" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-base-content line-clamp-1">{{ item.productName }}</p>
                  <p class="text-xs text-base-content/50">{{ formatCurrency(item.price) }} × {{ item.qty }}</p>
                </div>
                <p class="text-sm font-medium text-primary shrink-0">{{ formatCurrency(Number(item.price) * item.qty) }}</p>
              </div>
            </div>
            <div class="border-t border-base-200 mt-3 pt-2 flex justify-between font-medium">
              <span class="text-xs text-base-content/50 uppercase tracking-wide">Total</span>
              <span class="text-base text-primary">{{ formatCurrency(selected.subtotal) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment info -->
        <div class="mt-4 pt-4 border-t border-base-200 flex items-center gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-base-content/40">Payment</p>
          <span class="badge badge-sm badge-soft" :class="paymentBadge(selected.paymentStatus)">
            {{ PAYMENT_LABELS[selected.paymentStatus] || selected.paymentStatus }}
          </span>
          <span v-if="selected.paymentMethod" class="text-xs text-base-content/40 capitalize">&middot; {{ selected.paymentMethod.replace('_', ' ') }}</span>
          <span v-if="selected.paidAt" class="text-xs text-base-content/40">&middot; {{ formatDate(selected.paidAt) }}</span>
        </div>

        <!-- Status editor -->
        <div class="mt-6 pt-4 border-t border-base-200">
          <p class="text-xs font-semibold uppercase tracking-wide text-base-content/40 mb-2">Update Status</p>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="s in ORDER_STATUSES"
              :key="s.value"
              @click="updateStatus(selected.id, s.value)"
              :disabled="selected.status === s.value || updatingId === selected.id"
              class="badge badge-sm cursor-pointer transition-all disabled:opacity-40 disabled:cursor-default"
              :class="selected.status === s.value ? `badge-soft ${statusBadge(s.value)}` : 'badge-ghost hover:badge-neutral'"
            >
              {{ s.label }}
            </button>
          </div>
        </div>

        <!-- Payment status editor -->
        <div class="mt-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-base-content/40 mb-2">Update Payment Status</p>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="p in PAYMENT_STATUSES"
              :key="p.value"
              @click="updatePaymentStatus(selected.id, p.value)"
              :disabled="selected.paymentStatus === p.value || updatingId === selected.id"
              class="badge badge-sm cursor-pointer transition-all disabled:opacity-40 disabled:cursor-default"
              :class="selected.paymentStatus === p.value ? `badge-soft ${paymentBadge(p.value)}` : 'badge-ghost hover:badge-neutral'"
            >
              {{ p.label }}
            </button>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-ghost btn-sm" @click="closeModal">Close</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeModal"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { IconX, IconEye, IconShoppingBag, IconDiamond } from '@tabler/icons-vue'
import type { Order, OrderStatus, PaymentStatus } from '~/types'

const { data: orders, refresh } = await useFetch<Order[]>('/api/orders')

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: 'Unpaid',
  paid: 'Paid',
  failed: 'Failed',
  expired: 'Expired',
}

const PAYMENT_STATUSES = Object.entries(PAYMENT_LABELS).map(([value, label]) => ({ value: value as PaymentStatus, label }))

function paymentBadge(status: string) {
  const map: Record<string, string> = {
    unpaid: 'badge-warning',
    paid: 'badge-success',
    failed: 'badge-error',
    expired: 'badge-ghost',
  }
  return map[status] || 'badge-ghost'
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const ORDER_STATUSES = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value: value as OrderStatus, label }))

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  ...ORDER_STATUSES,
]

const filterStatus = ref('')

const filteredOrders = computed(() => {
  if (!filterStatus.value) return orders.value ?? []
  return (orders.value ?? []).filter(o => o.status === filterStatus.value)
})

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    processing: 'badge-info',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-error',
  }
  return map[status] || 'badge-ghost'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatCurrency(val: string | number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val))
}

const modalRef = ref<HTMLDialogElement>()
const selected = ref<Order | null>(null)
const updatingId = ref<string | null>(null)

function openDetail(order: Order) {
  selected.value = order
  modalRef.value?.showModal()
}

function closeModal() {
  modalRef.value?.close()
  selected.value = null
}

async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
  updatingId.value = orderId
  try {
    const updated = await $fetch<Order>(`/api/orders/${orderId}`, { method: 'PUT', body: { paymentStatus } })
    if (orders.value) {
      const idx = orders.value.findIndex(o => o.id === orderId)
      if (idx !== -1) orders.value[idx] = updated
    }
    if (selected.value?.id === orderId) selected.value = updated
  } catch {}
  updatingId.value = null
}

async function updateStatus(orderId: string, status: OrderStatus) {
  updatingId.value = orderId
  try {
    const updated = await $fetch<Order>(`/api/orders/${orderId}`, { method: 'PUT', body: { status } })
    // update orders list & selected in place
    if (orders.value) {
      const idx = orders.value.findIndex(o => o.id === orderId)
      if (idx !== -1) orders.value[idx] = updated
    }
    if (selected.value?.id === orderId) selected.value = updated
  } catch {}
  updatingId.value = null
}
</script>
