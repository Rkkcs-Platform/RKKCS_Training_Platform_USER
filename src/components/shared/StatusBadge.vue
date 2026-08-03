<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusTone =
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'in_progress'
  | 'in_transit'
  | 'success'
  | 'error'
  | 'paid'
  | 'unpaid'
  | 'failed'

const props = defineProps<{
  status: StatusTone
  label?: string
}>()

const { t } = useI18n()

const statusClassMap: Record<StatusTone, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50',
  confirmed: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50',
  shipping: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50',
  delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50',
  in_progress: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50',
  in_transit: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
  error: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
  unpaid: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50',
  failed: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50',
}

const className = computed(() => statusClassMap[props.status])
const translatedLabel = computed(() => t(`status.${props.status}`))
</script>

<template>
  <Badge
    variant="outline"
    :class="cn('font-medium', className)"
  >
    {{ label ?? translatedLabel }}
  </Badge>
</template>
