<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { showRequestFailed } from '@/common'
import KpiCard from '@/components/shared/KpiCard.vue'
import SectionCard from '@/components/shared/SectionCard.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { fetchDashboard } from '@/services/order.service'
import type { ShopDashboard } from '@/types/order'

const isLoading = ref(false)
const data = ref<ShopDashboard | null>(null)

const maxRevenue = computed(() => {
  const amounts = data.value?.revenueTrend.map((item) => item.amount) ?? [0]
  return Math.max(...amounts, 1)
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatKpiValue(kpi: ShopDashboard['kpis'][number]) {
  if (kpi.isCurrency) return formatCurrency(kpi.value)
  return kpi.value
}

onMounted(async () => {
  isLoading.value = true
  try {
    data.value = await fetchDashboard()
  } catch {
    showRequestFailed('Không tải được dashboard')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="space-y-5">
    <div v-if="isLoading" class="text-muted-foreground">
      Đang tải dashboard...
    </div>

    <template v-else-if="data">
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          v-for="kpi in data.kpis"
          :key="kpi.label"
          :label="kpi.label"
          :value="formatKpiValue(kpi)"
          :change="kpi.change"
        />
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
        <Card
          v-for="item in data.statusSummary"
          :key="item.label"
          class="shadow-sm"
        >
          <CardContent class="p-4">
            <p class="text-xs text-muted-foreground">{{ item.label }}</p>
            <p class="mt-2 text-2xl font-bold">{{ item.value }}</p>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Doanh thu (7 ngày gần nhất)">
          <div class="flex h-40 items-end gap-2">
            <div
              v-for="point in data.revenueTrend"
              :key="point.date"
              class="flex flex-1 flex-col items-center gap-2"
            >
              <div
                class="w-full rounded-t-md bg-primary/80"
                :style="{
                  height: `${(point.amount / maxRevenue) * 100}%`,
                  minHeight: '12px',
                }"
              />
              <span class="text-[10px] text-muted-foreground">
                {{ point.date.slice(5) }}
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Đơn hàng mới nhất">
          <div
            v-if="!data.recentOrders.length"
            class="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground"
          >
            Chưa có đơn hàng
          </div>
          <div v-else class="space-y-3">
            <RouterLink
              v-for="order in data.recentOrders"
              :key="order.id"
              :to="{ name: 'order-detail', params: { id: order.id } }"
              class="flex items-center justify-between gap-3 rounded-xl border p-3 transition hover:border-primary/30"
            >
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold">{{ order.orderCode }}</p>
                <p class="text-xs text-muted-foreground">{{ order.customer }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold">{{ formatCurrency(order.amount) }}</p>
                <StatusBadge :status="order.status" class="mt-1" />
              </div>
            </RouterLink>
          </div>
          <Button as-child variant="outline" class="mt-4 w-full">
            <RouterLink :to="{ name: 'orders' }">Xem tất cả đơn hàng</RouterLink>
          </Button>
        </SectionCard>
      </div>
    </template>

    <SectionCard
      title="Bắt đầu nhập mã"
      description="Transaction Center là module nhập mã giao dịch hàng ngày — đã sẵn sàng sử dụng."
    >
      <Button as-child>
        <RouterLink :to="{ name: 'transactions' }">Mở Transaction Center</RouterLink>
      </Button>
    </SectionCard>
  </div>
</template>
