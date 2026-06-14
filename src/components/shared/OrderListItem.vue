<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { MockOrder } from '@/common/mocks/operations.mock'
import { formatDisplayDate, formatDisplayTime } from '@/common'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { Card, CardContent } from '@/components/ui/card'

defineProps<{
  order: MockOrder
}>()

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>

<template>
  <RouterLink :to="{ name: 'order-detail', params: { id: order.id } }">
    <Card class="shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <CardContent class="flex items-center gap-4 p-4">
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate font-semibold">{{ order.id }}</p>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ formatDisplayDate(order.createdAt) }}
                · {{ formatDisplayTime(order.createdAt) }}
              </p>
            </div>
            <StatusBadge :status="order.status" />
          </div>
          <div class="mt-3 flex items-center justify-between gap-3 text-sm">
            <span class="truncate text-muted-foreground">{{ order.customerName }}</span>
            <span class="shrink-0 font-semibold">{{ formatCurrency(order.amount) }}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </RouterLink>
</template>
