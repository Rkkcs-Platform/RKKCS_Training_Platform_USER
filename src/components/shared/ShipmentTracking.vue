<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatDisplayDate, formatDisplayTime } from '@/common'
import { useCleanText } from '@/common/utils/format'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import TrackingMap from '@/components/shared/TrackingMap.vue'
import { cn } from '@/lib/utils'
import type {
  ShipmentMapData,
  ShipmentTimelineStep,
  ShipmentTrackingEvent,
  ShipmentStatus,
} from '@/types/order'

defineProps<{
  status: ShipmentStatus
  timeline?: ShipmentTimelineStep[]
  events?: ShipmentTrackingEvent[]
  currentLocation?: string
  map?: ShipmentMapData | null
  mapHeightClass?: string
}>()

const { t } = useI18n()
const cleanText = useCleanText()

const statusLabelKeys: Record<ShipmentStatus, string> = {
  pending: 'shipments.statusPending',
  in_transit: 'shipments.statusInTransit',
  delivered: 'shipments.statusDelivered',
}

const timelineLabelKeys: Record<string, string> = {
  pending: 'shipments.timelinePending',
  in_transit: 'shipments.timelineInTransit',
  delivered: 'shipments.timelineDelivered',
}

function getTimelineLabel(step: ShipmentTimelineStep) {
  const key = timelineLabelKeys[step.key || '']
  return key ? t(key) : step.label
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
      <div>
        <p class="text-xs text-muted-foreground">{{ t('shipments.shippingStatus') }}</p>
        <p class="mt-1 text-lg font-semibold">
          {{ t(statusLabelKeys[status]) || status }}
        </p>
        <p v-if="currentLocation" class="mt-1 text-sm text-muted-foreground">
          {{ t('shipments.position') }}: {{ cleanText(currentLocation) }}
        </p>
      </div>
      <StatusBadge :status="status" />
    </div>

    <div v-if="map?.current?.lat && map?.destination?.lat">
      <div class="mb-3">
        <p class="text-sm font-medium">{{ t('shipments.mapTitle') }}</p>
      </div>
      <TrackingMap :map="map" :height-class="mapHeightClass" />
    </div>

    <div v-if="timeline?.length">
      <p class="mb-3 text-sm font-medium">{{ t('shipments.progressTitle') }}</p>
      <div class="space-y-0">
        <div
          v-for="(step, index) in timeline"
          :key="step.key || step.label"
          class="flex gap-3"
        >
          <div class="flex flex-col items-center">
            <div
              :class="
                cn(
                  'size-3 rounded-full',
                  step.done
                    ? 'bg-emerald-500'
                    : step.current
                      ? 'bg-primary'
                      : 'bg-muted',
                )
              "
            />
            <div
              v-if="index < timeline.length - 1"
              class="my-1 w-px flex-1 bg-border"
            />
          </div>
          <div class="pb-4">
            <p
              :class="
                cn(
                  'text-sm font-medium',
                  step.current
                    ? 'text-primary'
                    : step.done
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                )
              "
            >
              {{ getTimelineLabel(step) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="events?.length">
      <p class="mb-3 text-sm font-medium">{{ t('shipments.trackingHistoryTitle') }}</p>
      <div class="space-y-3">
        <div
          v-for="event in [...events].reverse()"
          :key="event.id"
          class="rounded-xl border p-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-medium">
                {{ cleanText(event.note) || t(statusLabelKeys[event.status]) || event.status }}
              </p>
              <p
                v-if="event.location"
                class="mt-1 text-sm text-muted-foreground"
              >
                {{ cleanText(event.location) }}
              </p>
            </div>
            <StatusBadge :status="event.status" class="shrink-0" />
          </div>
          <p
            v-if="event.createdAt"
            class="mt-2 text-xs text-muted-foreground"
          >
            {{ formatDisplayDate(event.createdAt) }}
            · {{ formatDisplayTime(event.createdAt) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
