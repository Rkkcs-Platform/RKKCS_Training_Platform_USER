<script setup lang="ts">
defineProps<{
  percent: number
}>()
</script>

<template>
  <div class="h-2.5 overflow-hidden rounded-full bg-muted">
    <div
      class="h-full rounded-full bg-primary transition-all duration-300"
      :style="{ width: `${Math.min(100, Math.max(0, percent))}%` }"
    />
  </div>
</template>
