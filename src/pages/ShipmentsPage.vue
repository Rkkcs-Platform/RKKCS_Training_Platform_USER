<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { formatDisplayDate, showRequestFailed } from '@/common'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { Card, CardContent } from '@/components/ui/card'
import { useShipmentsStore } from '@/stores/orders'

const { t } = useI18n()
const shipmentsStore = useShipmentsStore()

onMounted(async () => {
  try {
    await shipmentsStore.loadShipments()
  } catch {
    showRequestFailed(t('shipments.loadFailed'))
  }
})
</script>

<template>
  <div class="space-y-5">
    <div v-if="shipmentsStore.isLoadingList" class="text-muted-foreground">
      {{ t('shipments.loadingShipments') }}
    </div>

    <template v-else>
      <div class="space-y-3">
        <RouterLink
          v-for="shipment in shipmentsStore.items"
          :key="shipment.id"
          :to="{ name: 'shipment-detail', params: { id: shipment.id } }"
        >
          <Card class="shadow-sm transition hover:border-primary/30">
            <CardContent class="flex items-center justify-between gap-4 p-4">
              <div class="min-w-0">
                <p class="font-semibold">{{ shipment.shipmentCode }}</p>
                <p class="mt-1 text-sm text-muted-foreground">
                  {{ shipment.orderCode || shipment.orderId }}
                  · {{ shipment.carrier || '—' }}
                </p>
                <p class="mt-1 text-xs text-muted-foreground">
                  {{ t('shipments.position') }}: {{ shipment.currentLocation || '—' }}
                  · ETA:
                  {{
                    shipment.eta
                      ? formatDisplayDate(shipment.eta)
                      : '—'
                  }}
                </p>
              </div>
              <StatusBadge :status="shipment.status" />
            </CardContent>
          </Card>
        </RouterLink>
      </div>

      <p
        v-if="!shipmentsStore.items.length"
        class="rounded-xl border border-dashed p-8 text-center text-muted-foreground"
      >
        {{ t('shipments.noShipments') }}
      </p>
    </template>
  </div>
</template>
