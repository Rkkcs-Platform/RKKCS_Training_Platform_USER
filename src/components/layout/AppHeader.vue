<script setup lang="ts">
import { Bell, Menu } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ROUTE_TITLES } from '@/common/constants/navigation'
import { APP_LABELS } from '@/common/constants/messages'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  showMenuButton?: boolean
}>()

const emit = defineEmits<{
  openSidebar: []
}>()

const route = useRoute()

const title = computed(() => {
  const routeName = String(route.name ?? 'dashboard')
  return ROUTE_TITLES[routeName] ?? APP_LABELS.appName
})
</script>

<template>
  <header class="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
    <div class="flex h-14 items-center gap-3 px-4 lg:px-6">
      <Button
        v-if="showMenuButton"
        variant="ghost"
        size="icon"
        class="lg:hidden"
        @click="emit('openSidebar')"
      >
        <Menu class="size-5" />
      </Button>

      <div class="min-w-0 flex-1">
        <p class="truncate text-base font-semibold">{{ title }}</p>
      </div>

      <Button variant="ghost" size="icon" class="relative">
        <Bell class="size-5" />
        <span class="absolute right-2 top-2 size-2 rounded-full bg-primary" />
      </Button>
    </div>
  </header>
</template>
