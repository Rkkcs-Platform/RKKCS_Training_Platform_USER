<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDisplayDate, showRequestFailed } from '@/common'
import SectionCard from '@/components/shared/SectionCard.vue'
import ShipmentTracking from '@/components/shared/ShipmentTracking.vue'
import { Button } from '@/components/ui/button'
import { useShipmentsStore } from '@/stores/orders'

const route = useRoute()
const router = useRouter()
const shipmentsStore = useShipmentsStore()

async function loadDetail(id: string) {
  try {
    await shipmentsStore.loadShipmentDetail(id)
  } catch {
    shipmentsStore.clearDetail()
    showRequestFailed('Không tải được chi tiết vận đơn')
  }
}

onMounted(() => {
  void loadDetail(String(route.params.id))
})

watch(
  () => route.params.id,
  (id) => {
    if (id) void loadDetail(String(id))
  },
)
</script>

<template>
  <div v-if="shipmentsStore.isLoadingDetail" class="text-muted-foreground">
    Đang tải tracking vận đơn...
  </div>

  <div v-else-if="shipmentsStore.detail" class="space-y-5">
    <div>
      <h2 class="text-xl font-bold">
        {{ shipmentsStore.detail.shipmentCode }}
      </h2>
      <p class="text-sm text-muted-foreground">
        Mã GD: {{ shipmentsStore.detail.transactionCode }}
      </p>
      <p class="text-sm text-muted-foreground">
        Đơn hàng: {{ shipmentsStore.detail.orderCode || shipmentsStore.detail.orderId }}
      </p>
    </div>

    <SectionCard title="Tracking đơn hàng">
      <ShipmentTracking
        :status="shipmentsStore.detail.status"
        :timeline="shipmentsStore.detail.timeline"
        :events="shipmentsStore.detail.events"
        :current-location="shipmentsStore.detail.currentLocation"
        :map="shipmentsStore.detail.map"
        map-height-class="h-72 sm:h-96"
      />
    </SectionCard>

    <SectionCard title="Thông tin vận chuyển">
      <dl class="grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs text-muted-foreground">Đơn vị vận chuyển</dt>
          <dd class="mt-1 font-medium">
            {{ shipmentsStore.detail.carrier || '—' }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">Địa chỉ giao</dt>
          <dd class="mt-1 font-medium">
            {{ shipmentsStore.detail.deliveryAddress || '—' }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">ETA</dt>
          <dd class="mt-1 font-medium">
            {{
              shipmentsStore.detail.eta
                ? formatDisplayDate(shipmentsStore.detail.eta)
                : '—'
            }}
          </dd>
        </div>
      </dl>

      <Button
        class="mt-4 w-full sm:w-auto"
        variant="outline"
        @click="
          router.push({
            name: 'order-detail',
            params: { id: shipmentsStore.detail!.orderId },
          })
        "
      >
        Cập nhật đơn / trạng thái ship
      </Button>
    </SectionCard>
  </div>

  <div
    v-else
    class="rounded-xl border border-dashed p-10 text-center text-muted-foreground"
  >
    Không tìm thấy vận đơn
  </div>
</template>
