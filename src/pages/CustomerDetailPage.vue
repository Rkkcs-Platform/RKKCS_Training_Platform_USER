<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDisplayDate, showRequestFailed } from '@/common'
import SectionCard from '@/components/shared/SectionCard.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { fetchCustomerById } from '@/services/order.service'
import type { CustomerDetail } from '@/types/order'

const route = useRoute()
const router = useRouter()
const detail = ref<CustomerDetail | null>(null)
const isLoading = ref(false)

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

async function load(id: string) {
  isLoading.value = true
  detail.value = null
  try {
    detail.value = await fetchCustomerById(id)
  } catch {
    showRequestFailed('Không tải được chi tiết khách hàng')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void load(String(route.params.id))
})

watch(
  () => route.params.id,
  (id) => {
    if (id) void load(String(id))
  },
)
</script>

<template>
  <div v-if="isLoading" class="text-muted-foreground">
    Đang tải chi tiết khách hàng...
  </div>

  <div v-else-if="detail" class="space-y-5">
    <div>
      <h2 class="text-xl font-bold">{{ detail.fullName }}</h2>
      <p class="text-sm text-muted-foreground">{{ detail.customerCode }}</p>
    </div>

    <SectionCard title="Thông tin khách hàng">
      <dl class="grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs text-muted-foreground">Số điện thoại</dt>
          <dd class="mt-1 font-medium">{{ detail.phone || '—' }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">Email</dt>
          <dd class="mt-1 font-medium">{{ detail.email || '—' }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">Tổng chi tiêu</dt>
          <dd class="mt-1 text-lg font-bold">
            {{ formatCurrency(detail.totalSpent) }}
          </dd>
        </div>
      </dl>
    </SectionCard>

    <SectionCard title="Đơn hàng gần đây">
      <div v-if="!detail.orders.length" class="text-sm text-muted-foreground">
        Chưa có đơn hàng
      </div>
      <div v-else class="space-y-3">
        <button
          v-for="order in detail.orders"
          :key="order.id"
          type="button"
          class="flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition hover:border-primary/30"
          @click="router.push({ name: 'order-detail', params: { id: order.id } })"
        >
          <div class="min-w-0">
            <p class="truncate font-semibold">{{ order.orderCode }}</p>
            <p class="text-xs text-muted-foreground">
              {{ order.transactionCode }}
              <span v-if="order.createdAt">
                · {{ formatDisplayDate(order.createdAt) }}
              </span>
            </p>
          </div>
          <div class="text-right">
            <p class="font-semibold">{{ formatCurrency(order.amount) }}</p>
            <StatusBadge :status="order.status" class="mt-1" />
          </div>
        </button>
      </div>
    </SectionCard>

    <Button variant="outline" @click="router.push({ name: 'customers' })">
      Quay lại danh sách
    </Button>
  </div>

  <div
    v-else
    class="rounded-xl border border-dashed p-10 text-center text-muted-foreground"
  >
    Không tìm thấy khách hàng
  </div>
</template>
