<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { MOCK_SHIPMENTS } from '@/common/mocks/operations.mock'
import ComingSoonBanner from '@/components/shared/ComingSoonBanner.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { Card, CardContent } from '@/components/ui/card'

const shipments = MOCK_SHIPMENTS
</script>

<template>
  <div class="space-y-5">
    <ComingSoonBanner />

    <div class="space-y-3">
      <RouterLink
        v-for="shipment in shipments"
        :key="shipment.id"
        :to="{ name: 'shipment-detail', params: { id: shipment.id } }"
      >
        <Card class="shadow-sm transition hover:border-primary/30">
          <CardContent class="flex items-center justify-between gap-4 p-4">
            <div class="min-w-0">
              <p class="font-semibold">{{ shipment.id }}</p>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ shipment.orderId }} · {{ shipment.carrier }}
              </p>
              <p class="mt-1 text-xs text-muted-foreground">
                ETA: {{ shipment.eta }}
              </p>
            </div>
            <StatusBadge :status="shipment.status" />
          </CardContent>
        </Card>
      </RouterLink>
    </div>
  </div>
</template>
