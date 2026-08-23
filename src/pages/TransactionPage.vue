<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { AlertTriangle, CheckCircle2, ExternalLink, Info, Loader2, Pencil, RefreshCw, Upload } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import {
  formatDisplayTime,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fetchOrderByTransactionCode } from '@/services/order.service'
import { useChallengeStore } from '@/stores/challenge'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const labels = PAGE_LABELS.challenge
const challengeStore = useChallengeStore()
const authStore = useAuthStore()
const codesInput = ref('')
const isUploading = ref(false)
const navigatingCode = ref<string | null>(null)
const showCompletedDialog = ref(false)

// Track inline edit state for wrong answers in the list
const editingAnswers = reactive<Record<number, { code: string, loading: boolean }>>({})

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

const hasWrongCodes = computed(() => {
  return (challengeStore.today?.wrong ?? 0) > 0
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
        showCompletedDialog.value = true
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

function startEditAnswer(order: number, currentCode: string) {
  editingAnswers[order] = { code: currentCode, loading: false }
}

function cancelEditAnswer(order: number) {
  delete editingAnswers[order]
}

async function handleResubmitFromList(order: number) {
  const edit = editingAnswers[order]
  if (!edit || !edit.code.trim() || edit.loading) return

  edit.loading = true

  try {
    const result = await challengeStore.resubmitCode(order, edit.code.trim())
    showSubmitResult(result.isCorrect)

    if (result.isCorrect) {
      delete editingAnswers[order]
    } else {
      edit.loading = false
      // Keep editing state so user can try again
    }
  } catch (error) {
    edit.loading = false
    showSubmitFailed(getErrorMessage(error))
  }
}

async function navigateToOrder(code: string) {
  if (navigatingCode.value) return
  navigatingCode.value = code

  const maxRetries = 3
  const delayMs = 1000

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const order = await fetchOrderByTransactionCode(code)
      await router.push({ name: 'order-detail', params: { id: order.id } })
      return
    } catch {
      // Order may not be created yet — wait and retry
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, delayMs))
      }
    }
  }

  navigatingCode.value = null
}
</script>

<template>
  <div class="space-y-5">
    <div v-if="challengeStore.isLoading" class="text-center text-muted-foreground">
      {{ t('common.loading') }}
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
        :description="t('transactions.batchDescription')"
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
            <p class="text-xs text-muted-foreground">{{ t('transactions.totalNeeded') }}</p>
            <p class="mt-1 text-2xl font-bold">{{ challengeStore.today.totalCodes }}</p>
          </div>
          <div class="rounded-xl border border-sky-200 bg-sky-50 p-3 text-center">
            <p class="text-xs text-sky-600">{{ t('transactions.uploaded') }}</p>
            <p class="mt-1 text-2xl font-bold text-sky-700">
              {{ challengeStore.today.submitted }}
            </p>
          </div>
          <div class="rounded-xl border bg-muted/40 p-3 text-center">
            <p class="text-xs text-muted-foreground">{{ t('transactions.remaining') }}</p>
            <p class="mt-1 text-2xl font-bold">{{ remaining }}</p>
          </div>
        </div>

        <div class="mt-5 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">{{ t('transactions.progress') }}</span>
            <span class="font-medium">{{ challengeStore.progressPercent }}%</span>
          </div>
          <ProgressBar :percent="challengeStore.progressPercent" />
        </div>
      </SectionCard>

      <SectionCard
        v-if="!challengeStore.isCompleted"
        :title="t('transactions.inputTitle')"
        :description="t('transactions.inputDescription')"
      >
        <div class="flex flex-row items-stretch gap-2 sm:flex-col sm:gap-4">
          <input
            v-model="codesInput"
            type="text"
            placeholder="AVBCOMMN"
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
              {{ isUploading ? t('transactions.sendingMobile') : t('transactions.sendCodeMobile', { count: parsedCodes.length }) }}
            </span>
            <span class="hidden sm:inline">
              {{
                isUploading
                  ? t('transactions.uploadingDesktop')
                  : t('transactions.uploadCodeDesktop', { count: parsedCodes.length })
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

      <div
        v-if="hasWrongCodes"
        class="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
      >
        <AlertTriangle class="mt-0.5 size-4 shrink-0 text-rose-500" />
        <p class="text-sm text-rose-700">
          {{ t('transactions.wrongCodesWarning') }}
        </p>
      </div>

      <SectionCard
        :title="t('transactions.uploadedListTitle')"
        :description="t('transactions.uploadedListDescription', { correct: challengeStore.today.correct, wrong: challengeStore.today.wrong })"
      >
        <div v-if="challengeStore.isLoadingResult" class="text-muted-foreground">
          {{ t('transactions.loadingResult') }}
        </div>

        <div
          v-else-if="!challengeStore.todayResult?.answers.length"
          class="rounded-xl border border-dashed p-8 text-center text-muted-foreground"
        >
          {{ t('transactions.noUploaded') }}
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="(answer, index) in challengeStore.todayResult!.answers"
            :key="`${answer.order}-${answer.inputCode}`"
            :class="[
              'rounded-xl border px-4 py-3 transition-colors',
              answer.isCorrect
                ? 'cursor-pointer border-transparent hover:border-primary/40 hover:bg-primary/5'
                : 'border-rose-200 bg-rose-50/50',
            ]"
            @click="answer.isCorrect && navigateToOrder(answer.inputCode)"
          >
            <!-- Correct answer or non-editing wrong answer -->
            <div
              v-if="answer.isCorrect || !editingAnswers[answer.order]"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span
                  :class="[
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    answer.isCorrect
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-rose-100 text-rose-600',
                  ]"
                >
                  {{ index + 1 }}
                </span>
                <div class="min-w-0">
                  <p
                    :class="[
                      'font-mono text-sm font-semibold tracking-widest',
                      answer.isCorrect
                        ? 'text-primary underline decoration-primary/30 underline-offset-2'
                        : 'text-rose-700',
                    ]"
                  >
                    {{ answer.inputCode }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatDisplayTime(answer.submittedAt) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Loader2
                  v-if="navigatingCode === answer.inputCode"
                  class="size-4 animate-spin text-primary"
                />
                <template v-else-if="answer.isCorrect">
                  <CheckCircle2 class="size-5 text-emerald-600" />
                  <ExternalLink class="size-3.5 text-muted-foreground" />
                </template>
                <template v-else>
                  <span class="text-xs font-medium text-rose-600">
                    {{ t('transactions.invalid') }}
                  </span>
                  <button
                    class="ml-1 inline-flex items-center gap-1 rounded-md border border-sky-300 bg-sky-50 px-1.5 py-0.5 text-xs font-medium text-sky-600 transition-colors hover:border-sky-400 hover:bg-sky-100"
                    :title="t('transactions.resubmit')"
                    @click.stop="startEditAnswer(answer.order, answer.inputCode)"
                  >
                    <Pencil class="size-3" />
                    <span class="hidden sm:inline">{{ t('transactions.resubmit') }}</span>
                  </button>
                </template>
              </div>
            </div>

            <!-- Inline edit for wrong answer -->
            <div v-else class="flex items-center gap-2" @click.stop>
              <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {{ index + 1 }}
              </span>
              <input
                v-model="editingAnswers[answer.order].code"
                type="text"
                class="min-w-0 flex-1 rounded-lg border-2 border-sky-300 bg-sky-50/40 px-2.5 py-1.5 font-mono text-sm uppercase tracking-widest outline-none transition-colors focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200/80"
                :disabled="editingAnswers[answer.order].loading"
                @keyup.enter="handleResubmitFromList(answer.order)"
                @keyup.escape="cancelEditAnswer(answer.order)"
              />
              <Button
                size="sm"
                variant="outline"
                class="shrink-0 gap-1 border-primary bg-primary/5 text-xs text-primary hover:bg-primary/10"
                :disabled="!editingAnswers[answer.order].code.trim() || editingAnswers[answer.order].loading"
                @click.stop="handleResubmitFromList(answer.order)"
              >
                <Loader2 v-if="editingAnswers[answer.order].loading" class="size-3.5 animate-spin" />
                <RefreshCw v-else class="size-3.5" />
                <span class="hidden sm:inline">{{ editingAnswers[answer.order].loading ? t('transactions.resubmitting') : t('transactions.resubmit') }}</span>
              </Button>
              <button
                class="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                @click.stop="cancelEditAnswer(answer.order)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </SectionCard>
    </template>
  </div>

  <Dialog v-model:open="showCompletedDialog">
    <DialogContent class="sm:max-w-md">
      <DialogHeader class="items-center text-center">
        <div class="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-sky-100">
          <Info class="size-8 text-sky-600" />
        </div>
        <DialogTitle class="text-xl">
          {{ t('transactions.completedDialogTitle') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('transactions.completedDialogDescription', { name: authStore.user?.name || '' }) }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="challengeStore.today" class="grid grid-cols-3 gap-3 py-4">
        <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
          <p class="text-xs text-emerald-600">{{ t('transactions.uploaded') }}</p>
          <p class="mt-1 text-xl font-bold text-emerald-700">{{ challengeStore.today.submitted }}</p>
        </div>
        <div class="rounded-xl border border-sky-200 bg-sky-50 p-3 text-center">
          <p class="text-xs text-sky-600">{{ t('transactions.correctLabel') }}</p>
          <p class="mt-1 text-xl font-bold text-sky-700">{{ challengeStore.today.correct }}</p>
        </div>
        <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center">
          <p class="text-xs text-rose-600">{{ t('transactions.wrongLabel') }}</p>
          <p class="mt-1 text-xl font-bold text-rose-700">{{ challengeStore.today.wrong }}</p>
        </div>
      </div>

      <DialogFooter class="flex-col gap-2 sm:flex-col">
        <Button class="w-full" @click="showCompletedDialog = false">
          {{ t('transactions.completedDialogStay') }}
        </Button>
        <Button
          variant="outline"
          class="w-full"
          as-child
        >
          <RouterLink :to="{ name: 'history' }" @click="showCompletedDialog = false">
            {{ t('transactions.completedDialogHistory') }}
          </RouterLink>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
