<script setup lang="ts">
import { TrendingUp } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'

defineProps<{
  label: string
  value: string | number
  change?: number
}>()
</script>

<template>
  <Card class="shadow-sm">
    <CardContent class="p-4">
      <p class="text-xs font-medium text-muted-foreground">{{ label }}</p>
      <p class="mt-2 text-2xl font-bold tracking-tight">{{ value }}</p>
      <p
        v-if="change !== undefined"
        class="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600"
      >
        <TrendingUp class="size-3.5" />
        +{{ change }}% vs yesterday
      </p>
    </CardContent>
  </Card>
</template>
