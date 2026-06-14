<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { BOTTOM_NAV_ITEMS } from '@/common/constants/navigation'
import { cn } from '@/lib/utils'

const route = useRoute()

function isActive(name: string) {
  if (name === 'menu') {
    return route.name === 'menu'
  }

  return route.name === name
    || (name === 'orders' && route.name === 'order-detail')
    || (name === 'shipments' && route.name === 'shipment-detail')
}
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:hidden">
    <div class="mx-auto grid max-w-lg grid-cols-5 px-2 pb-[env(safe-area-inset-bottom)] pt-1">
      <RouterLink
        v-for="item in BOTTOM_NAV_ITEMS"
        :key="item.name"
        :to="{ name: item.name }"
        :class="
          cn(
            'flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium transition',
            isActive(item.name)
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )
        "
      >
        <component
          :is="item.icon"
          :class="cn('size-5', isActive(item.name) && 'stroke-[2.5px]')"
        />
        <span class="truncate">{{ item.label.split(' ')[0] }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
