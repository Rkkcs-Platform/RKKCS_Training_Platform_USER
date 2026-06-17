<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="cn('mx-auto w-full max-w-6xl px-4 py-5 lg:px-6 lg:py-8', $props.class)">
    <slot />
  </div>
</template>
