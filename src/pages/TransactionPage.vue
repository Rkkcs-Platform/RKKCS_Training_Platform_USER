<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { AlertTriangle, ExternalLink, Info, Loader2, Pencil, RefreshCw, Upload } from 'lucide-vue-next'
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
      showSubmitResult(result.isCorrect, receivedMessage(code))

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
    showSubmitResult(result.isCorrect, receivedMessage(edit.code.trim()))

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

function formatYen(amount?: number) {
  if (amount == null) return ''
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount)
}

function receivedMessage(code: string) {
  const preview = challengeStore.todayResult?.answers.find(
    (answer) => answer.inputCode.toUpperCase() === code.toUpperCase(),
  )?.orderPreview
  if (preview?.customerName) {
    return t('transactions.receivedToast', {
      name: preview.customerName,
      amount: formatYen(preview.amount),
    })
  }
  return t('transactions.receivedToastPlain')
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
        :title="t('transactions.todayTitle')"
        :description="t('transactions.batchDescription')"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge
            :status="challengeStore.isCompleted ? 'success' : 'in_progress'"
            :label="challengeStore.isCompleted ? t('transactions.statusDone') : t('transactions.statusWorking')"
          />
          <p class="text-base text-muted-foreground">
            {{ challengeStore.today.date }}
          </p>
        </div>

        <div class="mt-5 grid grid-cols-3 gap-3">
          <div class="rounded-xl border bg-muted/40 p-3 text-center">
            <p class="text-sm text-muted-foreground">{{ t('transactions.totalNeeded') }}</p>
            <p class="mt-1 text-3xl font-bold">{{ challengeStore.today.totalCodes }}</p>
          </div>
          <div class="rounded-xl border border-sky-200 bg-sky-50 p-3 text-center">
            <p class="text-sm text-sky-700">{{ t('transactions.uploaded') }}</p>
            <p class="mt-1 text-3xl font-bold text-sky-800">
              {{ challengeStore.today.correct }}
            </p>
          </div>
          <div class="rounded-xl border bg-muted/40 p-3 text-center">
            <p class="text-sm text-muted-foreground">{{ t('transactions.remaining') }}</p>
            <p class="mt-1 text-3xl font-bold">{{ remaining }}</p>
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
          <textarea
            v-model="codesInput"
            rows="2"
            :placeholder="t('transactions.codePlaceholder')"
            :disabled="isUploading"
            class="min-h-16 min-w-0 flex-1 rounded-xl border-2 border-sky-300 bg-sky-50/40 px-3 py-3 font-mono text-lg uppercase tracking-wide shadow-sm outline-none transition-colors focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200/80 disabled:cursor-not-allowed disabled:border-input disabled:bg-muted disabled:opacity-60 sm:w-full"
          />

          <Button
            class="h-14 shrink-0 gap-1.5 self-center px-4 text-base sm:min-w-44 sm:self-end"
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
        <p class="text-base text-rose-700">
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
            v-for="answer in challengeStore.todayResult!.answers"
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
              v-if="answer.isCorrect && !editingAnswers[answer.order]"
              class="flex gap-3"
            >
              <img
                v-if="answer.orderPreview?.imageUrl"
                :src="answer.orderPreview.imageUrl"
                :alt="answer.orderPreview.productName || answer.inputCode"
                class="size-16 shrink-0 rounded-xl object-cover"
              />
              <div
                v-else
                class="flex size-16 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-lg font-semibold tabular-nums text-sky-700"
              >
                {{ answer.order }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <p class="text-lg font-semibold leading-snug">
                    <span class="mr-1.5 tabular-nums text-sky-600">{{ answer.order }}.</span>{{ answer.orderPreview?.customerName || t('transactions.received') }}
                  </p>
                  <p v-if="answer.orderPreview?.amount != null" class="shrink-0 text-lg font-bold">
                    {{ formatYen(answer.orderPreview.amount) }}
                  </p>
                </div>
                <p v-if="answer.orderPreview?.productName" class="text-base">
                  {{ answer.orderPreview.productName }}
                  <span v-if="answer.orderPreview.extraItems" class="text-muted-foreground">
                    {{ t('transactions.extraItems', { count: answer.orderPreview.extraItems }) }}
                  </span>
                </p>
                <p
                  v-if="answer.orderPreview?.amount != null"
                  class="text-sm text-muted-foreground"
                >
                  {{ t('transactions.taxIncluded') }}
                </p>
                <p
                  v-if="answer.orderPreview?.deliveryAddress"
                  class="mt-1 text-sm leading-snug text-muted-foreground"
                >
                  {{ answer.orderPreview.deliveryAddress }}
                </p>
                <p class="mt-1 text-sm text-muted-foreground">
                  <span v-if="answer.orderPreview?.carrier && answer.orderPreview.carrier !== 'RKKCS Express'">{{ answer.orderPreview.carrier }} · </span>
                  {{ formatDisplayTime(answer.submittedAt) }}
                </p>
                <p class="mt-1 font-mono text-xs tracking-widest text-muted-foreground">
                  {{ answer.inputCode }}
                </p>
              </div>
              <Loader2
                v-if="navigatingCode === answer.inputCode"
                class="size-5 shrink-0 animate-spin text-primary"
              />
              <ExternalLink v-else class="size-4 shrink-0 text-muted-foreground" />
            </div>

            <div
              v-else-if="!editingAnswers[answer.order]"
              class="flex items-center justify-between gap-3"
            >
              <div class="min-w-0">
                <p class="text-base font-semibold text-rose-700">
                  <span class="mr-1.5 tabular-nums text-rose-600">{{ answer.order }}.</span>{{ t('transactions.invalid') }}
                </p>
                <p class="font-mono text-lg font-semibold tracking-widest text-rose-800">
                  {{ answer.inputCode }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ formatDisplayTime(answer.submittedAt) }}
                </p>
              </div>
              <button
                class="inline-flex shrink-0 items-center gap-1 rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-base font-medium text-sky-700"
                @click.stop="startEditAnswer(answer.order, answer.inputCode)"
              >
                <Pencil class="size-4" />
                {{ t('transactions.resubmit') }}
              </button>
            </div>

            <!-- Inline edit for wrong answer -->
            <div v-else class="flex items-center gap-2" @click.stop>
              <span class="w-6 shrink-0 text-center text-sm font-semibold tabular-nums text-rose-600">
                {{ answer.order }}.
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
