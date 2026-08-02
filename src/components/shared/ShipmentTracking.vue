<script setup lang="ts">
import { formatDisplayDate, formatDisplayTime } from '@/common'
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

const statusLabel: Record<ShipmentStatus, string> = {
  pending: 'Chờ lấy hàng',
  in_transit: 'Đang vận chuyển',
  delivered: 'Đã giao hàng',
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
      <div>
        <p class="text-xs text-muted-foreground">Trạng thái vận chuyển</p>
        <p class="mt-1 text-lg font-semibold">
          {{ statusLabel[status] || status }}
        </p>
        <p v-if="currentLocation" class="mt-1 text-sm text-muted-foreground">
          Vị trí: {{ currentLocation }}
        </p>
      </div>
      <StatusBadge :status="status" />
    </div>

    <div v-if="map?.current?.lat && map?.destination?.lat">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p class="text-sm font-medium">Bản đồ tracking</p>
        <p class="text-xs text-muted-foreground">
          {{
            map.isMock === false
              ? 'Ghim theo địa chỉ đường/số nhà (Nominatim)'
              : 'Ước lượng theo thành phố — nhập địa chỉ chi tiết để chính xác hơn'
          }}
        </p>
      </div>
      <TrackingMap :map="map" :height-class="mapHeightClass" />
    </div>

    <div v-if="timeline?.length">
      <p class="mb-3 text-sm font-medium">Tiến trình</p>
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
              {{ step.label }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="events?.length">
      <p class="mb-3 text-sm font-medium">Lịch sử tracking</p>
      <div class="space-y-3">
        <div
          v-for="event in [...events].reverse()"
          :key="event.id"
          class="rounded-xl border p-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-medium">
                {{ event.note || statusLabel[event.status] || event.status }}
              </p>
              <p
                v-if="event.location"
                class="mt-1 text-sm text-muted-foreground"
              >
                {{ event.location }}
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
