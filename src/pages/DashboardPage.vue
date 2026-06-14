<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { MOCK_DASHBOARD } from '@/common/mocks/operations.mock'
import ComingSoonBanner from '@/components/shared/ComingSoonBanner.vue'
import KpiCard from '@/components/shared/KpiCard.vue'
import SectionCard from '@/components/shared/SectionCard.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const data = MOCK_DASHBOARD
const maxRevenue = Math.max(...data.revenueTrend)
</script>

<template>
  <div class="space-y-5">
    <ComingSoonBanner
      title="Dashboard preview"
      description="Số liệu đơn hàng và doanh thu đang dùng dữ liệu mẫu. Module Transaction Center đã kết nối API thật."
    />

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard
        v-for="kpi in data.kpis"
        :key="kpi.label"
        :label="kpi.label"
        :value="kpi.value"
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
            v-for="(value, index) in data.revenueTrend"
            :key="index"
            class="flex flex-1 flex-col items-center gap-2"
          >
            <div
              class="w-full rounded-t-md bg-primary/80"
              :style="{ height: `${(value / maxRevenue) * 100}%`, minHeight: '12px' }"
            />
            <span class="text-[10px] text-muted-foreground">D{{ index + 1 }}</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Đơn hàng mới nhất">
        <div class="space-y-3">
          <div
            v-for="order in data.recentOrders"
            :key="order.id"
            class="flex items-center justify-between gap-3 rounded-xl border p-3"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold">{{ order.id }}</p>
              <p class="text-xs text-muted-foreground">{{ order.customer }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold">{{ order.amount }}</p>
              <StatusBadge :status="order.status" class="mt-1" />
            </div>
          </div>
        </div>
        <Button as-child variant="outline" class="mt-4 w-full">
          <RouterLink :to="{ name: 'orders' }">Xem tất cả đơn hàng</RouterLink>
        </Button>
      </SectionCard>
    </div>

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
