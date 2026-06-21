<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CheckCircle2, Loader2, Upload } from 'lucide-vue-next'
import {
  formatDisplayTime,
  showChallengeCompleted,
  showChallengeLoadFailed,
  showSubmitFailed,
  showSubmitResult,
} from '@/common'
import { PAGE_LABELS } from '@/common/constants/messages'
import { getErrorMessage } from '@/common/utils/error'
import ProgressBar from '@/components/shared/ProgressBar.vue'
import SectionCard from '@/components/shared/SectionCard.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { useChallengeStore } from '@/stores/challenge'

const labels = PAGE_LABELS.challenge
const challengeStore = useChallengeStore()
const codesInput = ref('')
const isUploading = ref(false)

const parsedCodes = computed(() =>
  codesInput.value
    .split(/\r?\n/)
    .map((line) => line.trim().toUpperCase())
    .filter(Boolean),
)

const remaining = computed(() => {
  if (!challengeStore.today) return 0
  return Math.max(challengeStore.today.totalCodes - challengeStore.today.submitted, 0)
})

const batchId = computed(() => {
  if (!challengeStore.today) return 'BATCH-...'
  return `BATCH-${challengeStore.today.date.replace(/-/g, '')}`
})

async function loadChallenge() {
  try {
    await challengeStore.loadToday()
  } catch {
    showChallengeLoadFailed()
  }
}

onMounted(() => {
  void loadChallenge()
})

async function handleUpload() {
  if (
    !parsedCodes.value.length
    || challengeStore.isCompleted
    || isUploading.value
  ) {
    return
  }

  isUploading.value = true

  try {
    for (const code of parsedCodes.value) {
      if (challengeStore.isCompleted) break

      const result = await challengeStore.submitCode(code)
      showSubmitResult(result.isCorrect)

      if (result.completed) {
        showChallengeCompleted()
        break
      }
    }

    codesInput.value = ''
  } catch (error) {
    showSubmitFailed(getErrorMessage(error))
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <div v-if="challengeStore.isLoading" class="text-center text-muted-foreground">
      Đang tải...
    </div>

    <div
      v-else-if="challengeStore.loadFailed"
      class="rounded-xl border border-dashed p-10 text-center"
    >
      <p class="font-medium">{{ labels.loadFailedTitle }}</p>
      <p class="mt-2 text-sm text-muted-foreground">{{ labels.loadFailedHint }}</p>
      <Button variant="outline" class="mt-4" @click="loadChallenge">
        {{ labels.retry }}
      </Button>
    </div>

    <template v-else-if="challengeStore.today">
      <SectionCard
        :title="batchId"
        description="Batch nhập mã giao dịch hôm nay"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge
            :status="challengeStore.isCompleted ? 'success' : 'in_progress'"
            :label="challengeStore.isCompleted ? 'Completed' : 'In Progress'"
          />
          <p class="text-sm text-muted-foreground">
            {{ challengeStore.today.date }}
          </p>
        </div>

        <div class="mt-5 grid grid-cols-3 gap-3">
          <div class="rounded-xl border bg-muted/40 p-3 text-center">
            <p class="text-xs text-muted-foreground">Total needed</p>
            <p class="mt-1 text-2xl font-bold">{{ challengeStore.today.totalCodes }}</p>
          </div>
          <div class="rounded-xl border border-sky-200 bg-sky-50 p-3 text-center">
            <p class="text-xs text-sky-600">Uploaded</p>
            <p class="mt-1 text-2xl font-bold text-sky-700">
              {{ challengeStore.today.submitted }}
            </p>
          </div>
          <div class="rounded-xl border bg-muted/40 p-3 text-center">
            <p class="text-xs text-muted-foreground">Remaining</p>
            <p class="mt-1 text-2xl font-bold">{{ remaining }}</p>
          </div>
        </div>

        <div class="mt-5 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Progress</span>
            <span class="font-medium">{{ challengeStore.progressPercent }}%</span>
          </div>
          <ProgressBar :percent="challengeStore.progressPercent" />
        </div>
      </SectionCard>

      <SectionCard
        v-if="!challengeStore.isCompleted"
        title="1. Nhập mã giao dịch"
        description="Dán danh sách mã, mỗi mã một dòng. Hệ thống sẽ upload tuần tự."
      >
        <div class="flex flex-row items-stretch gap-2 sm:flex-col sm:gap-4">
          <input
            v-model="codesInput"
            type="text"
            placeholder="AVBCOMMN&#10;XYZ12345&#10;..."
            :disabled="isUploading"
            class="min-h-11 min-w-0 flex-1 rounded-xl border-2 border-sky-300 bg-sky-50/40 px-2.5 py-2.5 font-mono text-base uppercase tracking-wide shadow-sm outline-none transition-colors focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200/80 disabled:cursor-not-allowed disabled:border-input disabled:bg-muted disabled:opacity-60 sm:w-full sm:px-4 sm:py-3 sm:text-sm sm:tracking-widest"
          />

          <Button
            variant="outline"
            class="h-11 shrink-0 gap-1.5 self-center border-2 border-primary bg-primary/5 px-2.5 text-xs text-primary shadow-sm hover:bg-primary/10 disabled:border-input disabled:bg-muted disabled:text-muted-foreground sm:min-w-44 sm:gap-2 sm:self-end sm:px-4 sm:text-sm"
            :disabled="!parsedCodes.length || isUploading"
            @click="handleUpload"
          >
            <Loader2 v-if="isUploading" class="size-4 animate-spin" />
            <Upload v-else class="size-4" />
            <span class="sm:hidden">
              {{ isUploading ? 'Đang gửi...' : `Gửi mã (${parsedCodes.length})` }}
            </span>
            <span class="hidden sm:inline">
              {{
                isUploading
                  ? 'Đang upload...'
                  : `Upload mã (${parsedCodes.length})`
              }}
            </span>
          </Button>
        </div>
      </SectionCard>

      <p
        v-else
        class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700"
      >
        {{ labels.completedBanner }}
      </p>

      <SectionCard
        title="2. Danh sách đã upload"
        :description="`${challengeStore.today.correct} hợp lệ · ${challengeStore.today.wrong} không hợp lệ`"
      >
        <div v-if="challengeStore.isLoadingResult" class="text-muted-foreground">
          Đang tải...
        </div>

        <div
          v-else-if="!challengeStore.todayResult?.answers.length"
          class="rounded-xl border border-dashed p-8 text-center text-muted-foreground"
        >
          Chưa có mã nào được upload
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="answer in challengeStore.todayResult!.answers"
            :key="`${answer.order}-${answer.inputCode}`"
            class="flex items-center justify-between rounded-xl border px-4 py-3"
          >
            <div>
              <p class="font-mono text-sm font-semibold tracking-widest">
                {{ answer.inputCode }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ formatDisplayTime(answer.submittedAt) }}
              </p>
            </div>
            <CheckCircle2
              v-if="answer.isCorrect"
              class="size-5 text-emerald-600"
            />
            <span
              v-else
              class="text-xs font-medium text-rose-600"
            >
              Invalid
            </span>
          </div>
        </div>
      </SectionCard>
    </template>
  </div>
</template>
