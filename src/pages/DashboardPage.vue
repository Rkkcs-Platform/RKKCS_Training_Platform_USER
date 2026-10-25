<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { showRequestFailed } from '@/common'
import { useFormatCurrency } from '@/common/utils/format'
import KpiCard from '@/components/shared/KpiCard.vue'
import SectionCard from '@/components/shared/SectionCard.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { fetchDashboard } from '@/services/order.service'
import type { ShopDashboard } from '@/types/order'

const { t } = useI18n()
const isLoading = ref(false)
const data = ref<ShopDashboard | null>(null)

const maxRevenue = computed(() => {
  const amounts = data.value?.revenueTrend.map((item) => item.amount) ?? [0]
  return Math.max(...amounts, 1)
})

function barPercent(amount: number) {
  if (amount <= 0) return '0%'
  return `${Math.max((amount / maxRevenue.value) * 100, 8)}%`
}

const formatCurrency = useFormatCurrency()

function formatKpiValue(kpi: ShopDashboard['kpis'][number]) {
  if (kpi.isCurrency) return formatCurrency(kpi.value)
  return kpi.value
}

onMounted(async () => {
  isLoading.value = true
  try {
    data.value = await fetchDashboard()
  } catch {
    showRequestFailed(t('dashboard.loadFailed'))
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="space-y-5">
    <div v-if="isLoading" class="text-muted-foreground">
      {{ t('dashboard.loadingDashboard') }}
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
        <SectionCard :title="t('dashboard.revenueTitle')">
          <div class="flex h-48 gap-2">
            <div
              v-for="point in data.revenueTrend"
              :key="point.date"
              class="flex h-full min-w-0 flex-1 flex-col"
            >
              <div class="relative min-h-0 flex-1">
                <div
                  class="absolute inset-x-0 bottom-0 rounded-t-md bg-primary/80"
                  :style="{ height: barPercent(point.amount) }"
                />
              </div>
              <span class="pt-2 text-center text-[11px] text-muted-foreground">
                {{ point.date.slice(5) }}
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard :title="t('dashboard.recentOrdersTitle')">
          <div
            v-if="!data.recentOrders.length"
            class="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground"
          >
            {{ t('dashboard.noOrders') }}
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
            <RouterLink :to="{ name: 'orders' }">{{ t('dashboard.viewAllOrders') }}</RouterLink>
          </Button>
        </SectionCard>
      </div>
    </template>

    <SectionCard
      :title="t('dashboard.startCodeTitle')"
      :description="t('dashboard.startCodeDescription')"
    >
      <Button as-child>
        <RouterLink :to="{ name: 'transactions' }">{{ t('dashboard.openTransactionCenter') }}</RouterLink>
      </Button>
    </SectionCard>
  </div>
</template>
