<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusTone =
  | 'pending'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'in_progress'
  | 'in_transit'
  | 'success'
  | 'error'
  | 'paid'
  | 'unpaid'

const props = defineProps<{
  status: StatusTone
  label?: string
}>()

const config = computed(() => {
  const map: Record<StatusTone, { label: string; className: string }> = {
    pending: {
      label: 'Pending',
      className: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50',
    },
    shipping: {
      label: 'Shipping',
      className: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50',
    },
    delivered: {
      label: 'Delivered',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50',
    },
    in_progress: {
      label: 'In Progress',
      className: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50',
    },
    in_transit: {
      label: 'In Transit',
      className: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50',
    },
    success: {
      label: 'Success',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
    },
    error: {
      label: 'Error',
      className: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50',
    },
    paid: {
      label: 'Paid',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
    },
    unpaid: {
      label: 'Unpaid',
      className: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50',
    },
  }

  return map[props.status]
})
</script>

<template>
  <Badge
    variant="outline"
    :class="cn('font-medium', config.className)"
  >
    {{ label ?? config.label }}
  </Badge>
</template>
