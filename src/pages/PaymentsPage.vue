<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { formatDisplayDate, showRequestFailed } from '@/common'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { Card, CardContent } from '@/components/ui/card'
import { fetchPayments } from '@/services/order.service'
import type { PaymentListItem } from '@/types/order'

const items = ref<PaymentListItem[]>([])
const isLoading = ref(false)

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

onMounted(async () => {
  isLoading.value = true
  try {
    const data = await fetchPayments({ page: 1, limit: 100 })
    items.value = data.items ?? []
  } catch {
    showRequestFailed('Không tải được danh sách thanh toán')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="space-y-5">
    <div v-if="isLoading" class="text-muted-foreground">
      Đang tải thanh toán...
    </div>

    <template v-else>
      <div class="space-y-3">
        <RouterLink
          v-for="payment in items"
          :key="payment.id"
          :to="{ name: 'order-detail', params: { id: payment.orderId } }"
        >
          <Card class="shadow-sm transition hover:border-primary/30">
            <CardContent class="flex items-center justify-between gap-4 p-4">
              <div class="min-w-0">
                <p class="font-semibold">{{ payment.paymentCode }}</p>
                <p class="mt-1 text-sm text-muted-foreground">
                  {{ payment.orderCode || payment.orderId }}
                  · {{ payment.method || '—' }}
                </p>
                <p
                  v-if="payment.createdAt"
                  class="mt-1 text-xs text-muted-foreground"
                >
                  {{ formatDisplayDate(payment.createdAt) }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-semibold">{{ formatCurrency(payment.amount) }}</p>
                <StatusBadge :status="payment.status" class="mt-1" />
              </div>
            </CardContent>
          </Card>
        </RouterLink>
      </div>

      <p
        v-if="!items.length"
        class="rounded-xl border border-dashed p-8 text-center text-muted-foreground"
      >
        Chưa có thanh toán
      </p>
    </template>
  </div>
</template>
