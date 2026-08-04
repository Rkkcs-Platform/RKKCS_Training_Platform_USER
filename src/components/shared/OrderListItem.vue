<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { OrderListItem } from '@/types/order'
import { formatDisplayDate, formatDisplayTime } from '@/common'
import { useFormatCurrency } from '@/common/utils/format'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { Card, CardContent } from '@/components/ui/card'

defineProps<{
  order: OrderListItem
}>()

const { t } = useI18n()

const formatCurrency = useFormatCurrency()

function customerLabel(order: OrderListItem) {
  const name = order.customer.fullName?.trim()
  if (!name || /^chưa cập nhật$/i.test(name) || /^customer\s+/i.test(name)) {
    return t('orderList.customerNotUpdated')
  }
  return name
}
</script>

<template>
  <RouterLink :to="{ name: 'order-detail', params: { id: order.id } }">
    <Card class="shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <CardContent class="flex items-center gap-4 p-4">
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate font-semibold">{{ order.orderCode }}</p>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ formatDisplayDate(order.createdAt) }}
                · {{ formatDisplayTime(order.createdAt) }}
              </p>
            </div>
            <StatusBadge :status="order.status" />
          </div>
          <div class="mt-3 flex items-center justify-between gap-3 text-sm">
            <span class="truncate text-muted-foreground">
              {{ t('orderList.customerLabel') }}: {{ customerLabel(order) }}
            </span>
            <span class="shrink-0 font-semibold">{{ formatCurrency(order.amount) }}</span>
          </div>
          <p class="mt-1 truncate text-xs text-muted-foreground">
            {{ t('orderList.transactionCodeShort') }}: {{ order.transactionCode }}
          </p>
        </div>
      </CardContent>
    </Card>
  </RouterLink>
</template>
