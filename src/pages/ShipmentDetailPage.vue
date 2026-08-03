<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { formatDisplayDate, showRequestFailed } from '@/common'
import { useCleanText } from '@/common/utils/format'
import SectionCard from '@/components/shared/SectionCard.vue'
import ShipmentTracking from '@/components/shared/ShipmentTracking.vue'
import { Button } from '@/components/ui/button'
import { useShipmentsStore } from '@/stores/orders'

const { t } = useI18n()
const cleanText = useCleanText()
const route = useRoute()
const router = useRouter()
const shipmentsStore = useShipmentsStore()

async function loadDetail(id: string) {
  try {
    await shipmentsStore.loadShipmentDetail(id)
  } catch {
    shipmentsStore.clearDetail()
    showRequestFailed(t('shipments.loadDetailFailed'))
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
    {{ t('shipments.loadingDetail') }}
  </div>

  <div v-else-if="shipmentsStore.detail" class="space-y-5">
    <div>
      <h2 class="text-xl font-bold">
        {{ shipmentsStore.detail.shipmentCode }}
      </h2>
      <p class="text-sm text-muted-foreground">
        {{ t('shipments.transactionCode') }}: {{ shipmentsStore.detail.transactionCode }}
      </p>
      <p class="text-sm text-muted-foreground">
        {{ t('shipments.orderLabel') }}: {{ shipmentsStore.detail.orderCode || shipmentsStore.detail.orderId }}
      </p>
    </div>

    <SectionCard :title="t('shipments.trackingTitle')">
      <ShipmentTracking
        :status="shipmentsStore.detail.status"
        :timeline="shipmentsStore.detail.timeline"
        :events="shipmentsStore.detail.events"
        :current-location="cleanText(shipmentsStore.detail.currentLocation)"
        :map="shipmentsStore.detail.map"
        map-height-class="h-72 sm:h-96"
      />
    </SectionCard>

    <SectionCard :title="t('shipments.infoTitle')">
      <dl class="grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs text-muted-foreground">{{ t('shipments.carrierLabel') }}</dt>
          <dd class="mt-1 font-medium">
            {{ shipmentsStore.detail.carrier || '—' }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">{{ t('shipments.deliveryAddressLabel') }}</dt>
          <dd class="mt-1 font-medium">
            {{ cleanText(shipmentsStore.detail.deliveryAddress) || '—' }}
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
        {{ t('shipments.updateOrderStatus') }}
      </Button>
    </SectionCard>
  </div>

  <div
    v-else
    class="rounded-xl border border-dashed p-10 text-center text-muted-foreground"
  >
    {{ t('shipments.shipmentNotFound') }}
  </div>
</template>
