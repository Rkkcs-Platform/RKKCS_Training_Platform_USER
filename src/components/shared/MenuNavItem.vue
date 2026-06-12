<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import type { NavItem } from '@/common/constants/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

defineProps<{
  item: NavItem
  active?: boolean
}>()
</script>

<template>
  <RouterLink
    :to="{ name: item.name }"
    :class="
      cn(
        'flex items-center gap-3 rounded-xl px-3 py-3 transition',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-foreground hover:bg-muted/70',
        item.comingSoon && 'opacity-80',
      )
    "
  >
    <component :is="item.icon" class="size-5 shrink-0" />
    <span class="flex-1 text-sm font-medium">{{ item.label }}</span>
    <Badge
      v-if="item.comingSoon"
      variant="secondary"
      class="text-[10px] uppercase"
    >
      Soon
    </Badge>
    <ChevronRight v-else class="size-4 text-muted-foreground" />
  </RouterLink>
</template>
