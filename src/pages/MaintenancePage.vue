<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Construction, RefreshCw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import vi from '@/i18n/locales/vi'
import en from '@/i18n/locales/en'
import ja from '@/i18n/locales/ja'

const { t } = useI18n()
const router = useRouter()
const isChecking = ref(false)

async function handleRetry() {
  isChecking.value = true
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/setting/maintenance`)
    const data = await res.json()
    if (!data.maintenance) {
      await router.replace({ name: 'dashboard' })
    }
  } catch {
    // still down
  } finally {
    isChecking.value = false
  }
}
</script>

<template>
  <div class="flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50 px-6 text-center">
    <div class="mx-auto w-full max-w-lg space-y-6">
      <div class="mx-auto flex size-24 items-center justify-center rounded-full bg-sky-100 shadow-lg shadow-sky-100/50">
        <Construction class="size-12 text-sky-600" />
      </div>

      <div class="space-y-4 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-lg">
        <div class="space-y-1 text-center pb-3 border-b border-slate-100">
          <h1 class="text-xl font-extrabold text-slate-800">Hệ thống đang bảo trì</h1>
          <h2 class="text-base font-bold text-slate-600">System Under Maintenance</h2>
          <h2 class="text-sm font-semibold text-slate-500">システムメンテナンス中</h2>
        </div>
        <div class="space-y-3 text-sm text-slate-500 leading-relaxed pt-1">
          <p>{{ vi.maintenance.description }}</p>
          <p>{{ en.maintenance.description }}</p>
          <p>{{ ja.maintenance.description }}</p>
        </div>
      </div>

      <Button
        variant="outline"
        class="mx-auto gap-2 border-sky-200 bg-white/80 px-6 shadow-sm hover:bg-sky-50"
        :disabled="isChecking"
        @click="handleRetry"
      >
        <RefreshCw :class="['size-4', isChecking ? 'animate-spin' : '']" />
        {{ t('maintenance.retry') }}
      </Button>

      <div class="flex items-center justify-center gap-2 pt-2">
        <span class="relative flex size-2.5">
          <span class="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span class="relative inline-flex size-2.5 rounded-full bg-amber-500" />
        </span>
        <span class="text-xs text-slate-400">Maintenance in progress</span>
      </div>
    </div>
  </div>
</template>

