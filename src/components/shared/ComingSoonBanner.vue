<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'

defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm">
    <p class="flex items-center gap-2 font-medium text-primary">
      <Sparkles class="size-4" />
      {{ title ?? 'Sắp ra mắt' }}
    </p>
    <p class="mt-1 text-muted-foreground">
      {{
        description
          ?? 'Module này sẽ được kích hoạt khi hệ thống shop & order processing triển khai (Phase 2).'
      }}
    </p>
  </div>
</template>
