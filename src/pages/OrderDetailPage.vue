<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMockOrder } from '@/common/mocks/operations.mock'
import ComingSoonBanner from '@/components/shared/ComingSoonBanner.vue'
import SectionCard from '@/components/shared/SectionCard.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()

const order = computed(() => getMockOrder(String(route.params.id)))

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>

<template>
  <div v-if="order" class="space-y-5">
    <ComingSoonBanner />

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold">{{ order.id }}</h2>
        <p class="text-sm text-muted-foreground">{{ order.transactionCode }}</p>
      </div>
      <StatusBadge :status="order.status" />
    </div>

    <SectionCard title="Order Info">
      <dl class="grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs text-muted-foreground">Customer</dt>
          <dd class="mt-1 font-medium">{{ order.customerName }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">Phone</dt>
          <dd class="mt-1 font-medium">{{ order.phone }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">Email</dt>
          <dd class="mt-1 font-medium">{{ order.email }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">Address</dt>
          <dd class="mt-1 font-medium">{{ order.address }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">Total Amount</dt>
          <dd class="mt-1 text-lg font-bold">{{ formatCurrency(order.amount) }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">Payment</dt>
          <dd class="mt-1 font-medium">
            {{ order.paymentMethod }}
            ·
            <StatusBadge
              :status="order.paymentStatus"
              class="ml-1 inline-flex"
            />
          </dd>
        </div>
      </dl>
    </SectionCard>

    <SectionCard v-if="order.shipmentId" title="Shipment Info">
      <dl class="grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs text-muted-foreground">Shipment ID</dt>
          <dd class="mt-1 font-medium">{{ order.shipmentId }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">Carrier</dt>
          <dd class="mt-1 font-medium">{{ order.carrier }}</dd>
        </div>
      </dl>

      <Button
        class="mt-4 w-full sm:w-auto"
        @click="router.push({ name: 'shipment-detail', params: { id: order.shipmentId } })"
      >
        Xem chi tiết vận đơn
      </Button>
    </SectionCard>
  </div>

  <div
    v-else
    class="rounded-xl border border-dashed p-10 text-center text-muted-foreground"
  >
    Không tìm thấy đơn hàng
  </div>
</template>
