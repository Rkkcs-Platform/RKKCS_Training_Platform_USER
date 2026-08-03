<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { ShipmentMapData } from '@/types/order'

const props = defineProps<{
  map: ShipmentMapData | null | undefined
  heightClass?: string
}>()

const { t } = useI18n()
const container = ref<HTMLElement | null>(null)
let leafletMap: L.Map | null = null
let layerGroup: L.LayerGroup | null = null

function renderMap() {
  if (!container.value || !props.map?.current?.lat || !props.map?.destination?.lat) {
    return
  }

  const current = props.map.current
  const dest = props.map.destination

  if (!leafletMap) {
    leafletMap = L.map(container.value, {
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(leafletMap)

    layerGroup = L.layerGroup().addTo(leafletMap)
  }

  layerGroup?.clearLayers()

  const currentIcon = L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:999px;background:#2563eb;border:2px solid white;box-shadow:0 0 0 2px #2563eb;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })

  const destIcon = L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:999px;background:#dc2626;border:2px solid white;box-shadow:0 0 0 2px #dc2626;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })

  const currentMarker = L.marker([current.lat, current.lng], {
    icon: currentIcon,
  }).bindPopup(
    `<strong>${current.label || t('trackingMap.currentPosition')}</strong>`,
  )

  const destMarker = L.marker([dest.lat, dest.lng], {
    icon: destIcon,
  }).bindPopup(
    `<strong>${dest.label || t('trackingMap.deliveryPoint')}</strong>`,
  )

  const line = L.polyline(
    [
      [current.lat, current.lng],
      [dest.lat, dest.lng],
    ],
    {
      color: '#2563eb',
      weight: 3,
      opacity: 0.75,
      dashArray: '8 6',
    },
  )

  layerGroup?.addLayer(currentMarker)
  layerGroup?.addLayer(destMarker)
  layerGroup?.addLayer(line)

  leafletMap.fitBounds(
    L.latLngBounds(
      [current.lat, current.lng],
      [dest.lat, dest.lng],
    ).pad(0.35),
  )

  // Leaflet needs a tick after container is visible
  requestAnimationFrame(() => {
    leafletMap?.invalidateSize()
  })
}

onMounted(() => {
  renderMap()
})

watch(
  () => props.map,
  () => {
    renderMap()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  leafletMap?.remove()
  leafletMap = null
  layerGroup = null
})
</script>

<template>
  <div class="space-y-2">

    <div
      ref="container"
      :class="heightClass || 'h-64 sm:h-80'"
      class="w-full overflow-hidden rounded-xl border bg-muted/20"
    />

    <div class="flex flex-wrap gap-4 text-xs text-muted-foreground">
      <span class="inline-flex items-center gap-2">
        <span class="size-2.5 rounded-full bg-blue-600" />
        {{ t('trackingMap.currentOrderPosition') }}
      </span>
      <span class="inline-flex items-center gap-2">
        <span class="size-2.5 rounded-full bg-red-600" />
        {{ t('trackingMap.deliveryDestination') }}
      </span>
    </div>
  </div>
</template>
