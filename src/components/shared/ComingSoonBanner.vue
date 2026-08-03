<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

defineProps<{
  title?: string
  description?: string
}>()

const { t } = useI18n()
</script>

<template>
  <div class="rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm">
    <p class="flex items-center gap-2 font-medium text-primary">
      <Sparkles class="size-4" />
      {{ title ?? t('comingSoon.title') }}
    </p>
    <p class="mt-1 text-muted-foreground">
      {{
        description
          ?? t('comingSoon.description')
      }}
    </p>
  </div>
</template>
