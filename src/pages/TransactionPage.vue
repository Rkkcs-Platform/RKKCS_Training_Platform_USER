<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CheckCircle2, Upload } from 'lucide-vue-next'
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

function clearInput() {
  codesInput.value = ''
}

async function handleUpload() {
  if (
    !parsedCodes.value.length
    || challengeStore.isCompleted
    || challengeStore.isSubmitting
  ) {
    return
  }

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
        <textarea
          v-model="codesInput"
          rows="6"
          placeholder="AVBCOMMN&#10;XYZ12345&#10;..."
          :disabled="challengeStore.isSubmitting"
          class="min-h-36 w-full rounded-xl border bg-background px-4 py-3 font-mono text-sm uppercase tracking-widest outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        />

        <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            class="text-sm font-medium text-primary hover:underline"
            @click="clearInput"
          >
            Clear all
          </button>

          <Button
            class="h-11 sm:min-w-44"
            :disabled="!parsedCodes.length || challengeStore.isSubmitting"
            @click="handleUpload"
          >
            <Upload class="size-4" />
            {{
              challengeStore.isSubmitting
                ? 'Đang upload...'
                : `Upload mã (${parsedCodes.length})`
            }}
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
