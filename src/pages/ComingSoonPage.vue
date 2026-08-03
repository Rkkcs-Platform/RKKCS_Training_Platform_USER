<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { getRouteTitle } from '@/common/constants/navigation'
import ComingSoonBanner from '@/components/shared/ComingSoonBanner.vue'

const { t } = useI18n()
const route = useRoute()

const title = computed(() => getRouteTitle(String(route.name)))
</script>

<template>
  <div class="space-y-4">
    <ComingSoonBanner :title="t('comingSoon.titleWithModule', { module: title })" />
  </div>
</template>
