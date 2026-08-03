<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { SUPPORTED_LOCALES, setLocale, type AppLocale } from '@/i18n'
import { cn } from '@/lib/utils'

const { locale } = useI18n()
const open = ref(false)

const currentLocale = computed(() =>
  SUPPORTED_LOCALES.find((l) => l.code === locale.value) ?? SUPPORTED_LOCALES[0],
)

function handleSelect(code: AppLocale) {
  setLocale(code)
  open.value = false
}

function handleToggle() {
  open.value = !open.value
}

function handleClickOutside() {
  open.value = false
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-40" @click="handleClickOutside" />
  <div class="relative inline-flex">
    <button
      type="button"
      :class="
        cn(
          'flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border bg-background px-2.5 text-xs font-medium',
          'outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
        )
      "
      @click="handleToggle"
    >
      <span class="text-base leading-none">{{ currentLocale.flag }}</span>
      <span>{{ currentLocale.code.toUpperCase() }}</span>
      <svg
        class="size-3 text-muted-foreground transition"
        :class="open && 'rotate-180'"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M3 4.5L6 7.5L9 4.5" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <div
        v-if="open"
        class="absolute right-0 top-full z-50 mt-1.5 min-w-40 overflow-hidden rounded-xl border bg-background p-1 shadow-lg"
      >
        <button
          v-for="loc in SUPPORTED_LOCALES"
          :key="loc.code"
          type="button"
          :class="
            cn(
              'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition',
              loc.code === locale
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-foreground hover:bg-muted',
            )
          "
          @click="handleSelect(loc.code)"
        >
          <span class="text-lg leading-none">{{ loc.flag }}</span>
          <span>{{ loc.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>
