<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { formatDisplayDate, showRequestFailed } from '@/common'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { Card, CardContent } from '@/components/ui/card'
import { fetchCustomers } from '@/services/order.service'
import type { CustomerListItem } from '@/types/order'

const items = ref<CustomerListItem[]>([])
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
    const data = await fetchCustomers({ page: 1, limit: 100 })
    items.value = data.items ?? []
  } catch {
    showRequestFailed('Không tải được danh sách khách hàng')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="space-y-5">
    <div v-if="isLoading" class="text-muted-foreground">
      Đang tải khách hàng...
    </div>

    <template v-else>
      <div class="space-y-3">
        <RouterLink
          v-for="customer in items"
          :key="customer.id"
          :to="{ name: 'customer-detail', params: { id: customer.id } }"
        >
          <Card class="shadow-sm transition hover:border-primary/30">
            <CardContent class="flex items-center justify-between gap-4 p-4">
              <div class="min-w-0">
                <p class="font-semibold">{{ customer.fullName }}</p>
                <p class="mt-1 text-sm text-muted-foreground">
                  {{ customer.customerCode }}
                  <span v-if="customer.createdAt">
                    · {{ formatDisplayDate(customer.createdAt) }}
                  </span>
                </p>
              </div>
              <p class="shrink-0 font-semibold">
                {{ formatCurrency(customer.totalSpent) }}
              </p>
            </CardContent>
          </Card>
        </RouterLink>
      </div>

      <p
        v-if="!items.length"
        class="rounded-xl border border-dashed p-8 text-center text-muted-foreground"
      >
        Chưa có khách hàng
      </p>
    </template>
  </div>
</template>
