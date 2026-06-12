<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ROUTE_TITLES } from '@/common/constants/navigation'
import ComingSoonBanner from '@/components/shared/ComingSoonBanner.vue'

const route = useRoute()

const title = computed(() => ROUTE_TITLES[String(route.name)] ?? 'Module')
</script>

<template>
  <div class="space-y-4">
    <ComingSoonBanner :title="`${title} — Sắp ra mắt`" />
  </div>
</template>
