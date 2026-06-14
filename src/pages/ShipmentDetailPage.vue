<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getMockShipment } from '@/common/mocks/operations.mock'
import ComingSoonBanner from '@/components/shared/ComingSoonBanner.vue'
import SectionCard from '@/components/shared/SectionCard.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { cn } from '@/lib/utils'

const route = useRoute()
const shipment = computed(() => getMockShipment(String(route.params.id)))
</script>

<template>
  <div v-if="shipment" class="space-y-5">
    <ComingSoonBanner />

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold">{{ shipment.id }}</h2>
        <p class="text-sm text-muted-foreground">{{ shipment.transactionCode }}</p>
      </div>
      <StatusBadge :status="shipment.status" />
    </div>

    <SectionCard title="Thông tin vận chuyển">
      <dl class="grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs text-muted-foreground">Order ID</dt>
          <dd class="mt-1 font-medium">{{ shipment.orderId }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">Carrier</dt>
          <dd class="mt-1 font-medium">{{ shipment.carrier }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">ETA</dt>
          <dd class="mt-1 font-medium">{{ shipment.eta }}</dd>
        </div>
      </dl>
    </SectionCard>

    <SectionCard title="Tracking timeline">
      <div class="space-y-4">
        <div
          v-for="(step, index) in shipment.timeline"
          :key="step.label"
          class="flex gap-3"
        >
          <div class="flex flex-col items-center">
            <div
              :class="
                cn(
                  'size-3 rounded-full',
                  step.done ? 'bg-emerald-500' : step.current ? 'bg-primary' : 'bg-muted',
                )
              "
            />
            <div
              v-if="index < shipment.timeline.length - 1"
              class="my-1 w-px flex-1 bg-border"
            />
          </div>
          <div class="pb-4">
            <p
              :class="
                cn(
                  'text-sm font-medium',
                  step.current ? 'text-primary' : step.done ? 'text-foreground' : 'text-muted-foreground',
                )
              "
            >
              {{ step.label }}
            </p>
          </div>
        </div>
      </div>
    </SectionCard>

    <SectionCard title="Map preview">
      <div class="flex h-40 items-center justify-center rounded-xl border border-dashed bg-muted/40 text-sm text-muted-foreground">
        Bản đồ tracking sẽ hiển thị tại đây (Phase 2)
      </div>
    </SectionCard>
  </div>

  <div
    v-else
    class="rounded-xl border border-dashed p-10 text-center text-muted-foreground"
  >
    Không tìm thấy vận đơn
  </div>
</template>
