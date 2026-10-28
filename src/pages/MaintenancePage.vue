<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { setLocale, type AppLocale } from '@/i18n'
import logoUrl from '@/assets/logo.png'

const router = useRouter()
const untilIso = ref<string | null>(null)
const nowMs = ref(Date.now())
let pollTimer: ReturnType<typeof setInterval> | undefined
let countdownTimer: ReturnType<typeof setInterval> | undefined

const notices = [
  {
    title: 'コード入力システムは一時停止中です',
    body: 'システム更新のため現在ご利用いただけません。下記の予定時刻以降に再度アクセスしてください。',
    until: '再開予定時刻',
    remaining: '再開まで',
  },
  {
    title: 'Hệ thống tạm ngừng phục vụ',
    body: 'Hệ thống đang tạm dừng để khắc phục sự cố. Vui lòng quay trở lại sau thời gian dự kiến bên dưới.',
    until: 'Thời gian dự kiến hoạt động trở lại',
    remaining: 'Còn lại',
  },
  {
    title: '코드 입력 시스템이 일시 중단되었습니다',
    body: '시스템 업데이트로 현재 이용할 수 없습니다. 아래 예정 시각 이후에 다시 접속해 주세요.',
    until: '서비스 재개 예정 시각',
    remaining: '남은 시간',
  },
] as const

const untilDate = computed(() => {
  if (!untilIso.value) return null
  const date = new Date(untilIso.value)
  return Number.isNaN(date.getTime()) ? null : date
})

const untilLabel = computed(() => {
  if (!untilDate.value) return null
  return untilDate.value.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
})

const remainingMs = computed(() => {
  if (!untilDate.value) return null
  return Math.max(0, untilDate.value.getTime() - nowMs.value)
})

const countdownLabel = computed(() => {
  if (remainingMs.value == null) return null
  const totalSeconds = Math.floor(remainingMs.value / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
})

async function fetchMaintenanceStatus() {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/setting/maintenance`,
  )
  const data = await res.json() as {
    maintenance?: boolean
    language?: string
    until?: string | null
  }

  if (data.language && !sessionStorage.getItem('rkkcs-lang-initialized')) {
    setLocale(data.language as AppLocale)
  }

  untilIso.value = data.until ?? null
  return Boolean(data.maintenance)
}

onMounted(() => {
  void fetchMaintenanceStatus().catch(() => undefined)
  pollTimer = setInterval(() => {
    void fetchMaintenanceStatus()
      .then(async (stillDown) => {
        if (!stillDown) {
          await router.replace({ name: 'dashboard' })
        }
      })
      .catch(() => undefined)
  }, 30_000)

  countdownTimer = setInterval(() => {
    nowMs.value = Date.now()
    if (untilDate.value && untilDate.value.getTime() <= Date.now()) {
      void fetchMaintenanceStatus()
        .then(async (stillDown) => {
          if (!stillDown) {
            await router.replace({ name: 'dashboard' })
          }
        })
        .catch(() => undefined)
    }
  }, 1000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<template>
  <div class="flex min-h-svh flex-col bg-[#f3f4f6]">
    <main class="flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-12">
      <div class="w-full max-w-2xl overflow-hidden border border-slate-200 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)]">
        <div class="h-1.5 w-full bg-[#a3007e]" />

        <div class="flex flex-col items-center border-b border-slate-100 bg-white px-6 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
          <img
            :src="logoUrl"
            alt="RKKCS — 期待を超える 未来を創る"
            class="h-20 w-auto max-w-[min(100%,280px)] object-contain sm:h-24 sm:max-w-[320px]"
          />
          <p class="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            System notice
          </p>
        </div>

        <div class="divide-y divide-slate-100">
          <section
            v-for="(notice, index) in notices"
            :key="index"
            class="px-6 py-5 sm:px-8"
          >
            <h2 class="text-base font-semibold leading-snug text-slate-900 sm:text-lg">
              {{ notice.title }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-slate-600">
              {{ notice.body }}
            </p>
          </section>
        </div>

        <div
          v-if="untilLabel"
          class="border-t border-slate-200 bg-slate-50 px-6 py-7 sm:px-8"
        >
          <div class="space-y-1 text-center">
            <p
              v-for="(notice, index) in notices"
              :key="`until-${index}`"
              class="text-[11px] font-medium text-slate-500"
            >
              {{ notice.until }}
            </p>
          </div>
          <p class="mt-4 text-center text-4xl font-semibold tabular-nums tracking-tight text-[#a3007e] sm:text-5xl">
            {{ untilLabel }}
          </p>

          <div v-if="countdownLabel" class="mt-5 border-t border-slate-200/80 pt-5">
            <div class="space-y-0.5 text-center">
              <p
                v-for="(notice, index) in notices"
                :key="`remaining-${index}`"
                class="text-[11px] font-medium text-slate-500"
              >
                {{ notice.remaining }}
              </p>
            </div>
            <p class="mt-2 text-center font-mono text-2xl font-semibold tabular-nums tracking-wider text-slate-800 sm:text-3xl">
              {{ countdownLabel }}
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
