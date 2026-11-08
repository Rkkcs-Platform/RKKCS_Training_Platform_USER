<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import logoUrl from '@/assets/logo.png'

withDefaults(
  defineProps<{
    label?: string
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const { t } = useI18n()
const logoReady = ref(false)

// Warm the browser cache as soon as this module loads
const preload = new Image()
preload.src = logoUrl
if (preload.complete) {
  logoReady.value = true
} else {
  preload.onload = () => {
    logoReady.value = true
  }
}

onMounted(() => {
  if (preload.complete) logoReady.value = true
})
</script>

<template>
  <div
    :class="[
      'flex flex-col items-center justify-center text-center',
      compact ? 'gap-4 px-6 py-8' : 'min-h-[50vh] gap-5 px-6 py-16',
    ]"
    role="status"
    aria-live="polite"
  >
    <div class="relative mx-auto flex h-14 w-full max-w-[220px] items-center justify-center sm:h-16">
      <img
        :src="logoUrl"
        alt="RKK CSJ"
        width="220"
        height="58"
        decoding="sync"
        fetchpriority="high"
        :class="[
          'h-full w-auto max-w-full object-contain transition-opacity duration-150',
          logoReady ? 'opacity-100' : 'opacity-0',
        ]"
        @load="logoReady = true"
      />
      <span
        v-if="!logoReady"
        class="absolute inset-0 flex items-center justify-center text-lg font-bold tracking-[0.12em] text-[#a3007e]"
        aria-hidden="true"
      >
        RKK CSJ
      </span>
    </div>

    <div class="flex items-center justify-center gap-1.5" aria-hidden="true">
      <span class="size-2.5 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.3s]" />
      <span class="size-2.5 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.15s]" />
      <span class="size-2.5 animate-bounce rounded-full bg-sky-500" />
    </div>

    <div class="space-y-1">
      <p class="text-base font-semibold text-slate-800">
        {{ label || t('common.loading') }}
      </p>
      <p v-if="!compact" class="text-xs text-slate-500">
        RKK CSJ Training Platform
      </p>
    </div>
  </div>
</template>
