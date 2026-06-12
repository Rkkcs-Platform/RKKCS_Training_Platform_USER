<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="cn('mx-auto w-full max-w-6xl px-4 py-5 pb-24 lg:px-6 lg:py-8 lg:pb-8', $props.class)">
    <slot />
  </div>
</template>
