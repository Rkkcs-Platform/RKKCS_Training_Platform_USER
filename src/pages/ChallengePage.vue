<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Send } from 'lucide-vue-next'
import {
  showChallengeCompleted,
  showChallengeLoadFailed,
  showSubmitFailed,
  showSubmitResult,
} from '@/common'
import { getErrorMessage } from '@/common/utils/error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useChallengeStore } from '@/stores/challenge'

const challengeStore = useChallengeStore()
const code = ref('')

onMounted(async () => {
  try {
    await challengeStore.loadToday()
  } catch {
    showChallengeLoadFailed()
  }
})

async function handleSubmit() {
  const value = code.value.trim()

  if (!value || challengeStore.isCompleted || challengeStore.isSubmitting) {
    return
  }

  try {
    const result = await challengeStore.submitCode(value)
    code.value = ''

    showSubmitResult(result.isCorrect)

    if (result.completed) {
      showChallengeCompleted()
    }
  } catch (error) {
    showSubmitFailed(getErrorMessage(error))
  }
}
</script>

<template>
  <div class="space-y-5">
    <div v-if="challengeStore.isLoading" class="text-center text-muted-foreground">
      Đang tải challenge hôm nay...
    </div>

    <template v-else-if="challengeStore.today">
      <Card>
        <CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardDescription>Challenge hôm nay</CardDescription>
            <CardTitle class="text-2xl">{{ challengeStore.today.date }}</CardTitle>
          </div>
          <Badge :variant="challengeStore.isCompleted ? 'default' : 'secondary'">
            {{ challengeStore.isCompleted ? 'Hoàn thành' : 'Đang làm' }}
          </Badge>
        </CardHeader>
        <CardContent class="space-y-6">
          <div>
            <div class="mb-2 flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Tiến độ</span>
              <span class="font-medium">
                {{ challengeStore.today.submitted }} / {{ challengeStore.today.totalCodes }}
              </span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-muted">
              <div
                class="h-full rounded-full bg-primary transition-all"
                :style="{ width: `${challengeStore.progressPercent}%` }"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="rounded-xl border bg-muted/40 p-3 text-center">
              <p class="text-xs text-muted-foreground">Đã nhập</p>
              <p class="mt-1 text-2xl font-bold">{{ challengeStore.today.submitted }}</p>
            </div>
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
              <p class="text-xs text-emerald-600">Đúng</p>
              <p class="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {{ challengeStore.today.correct }}
              </p>
            </div>
            <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center dark:border-rose-900 dark:bg-rose-950/40">
              <p class="text-xs text-rose-600">Sai</p>
              <p class="mt-1 text-2xl font-bold text-rose-700 dark:text-rose-400">
                {{ challengeStore.today.wrong }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nhập mã</CardTitle>
          <CardDescription>
            Mỗi lần chỉ gửi một mã. Hệ thống báo đúng hoặc sai ngay lập tức.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            class="flex flex-col gap-3 sm:flex-row"
            @submit.prevent="handleSubmit"
          >
            <Input
              v-model="code"
              autocomplete="off"
              autocapitalize="characters"
              spellcheck="false"
              placeholder="VD: AVBCOMMN"
              :disabled="challengeStore.isCompleted || challengeStore.isSubmitting"
              class="h-12 text-lg font-semibold uppercase tracking-widest"
            />
            <Button
              type="submit"
              class="h-12 sm:min-w-36"
              :disabled="
                challengeStore.isCompleted ||
                challengeStore.isSubmitting ||
                !code.trim()
              "
            >
              <Send class="size-4" />
              {{ challengeStore.isSubmitting ? 'Đang gửi...' : 'Gửi mã' }}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p
        v-if="challengeStore.isCompleted"
        class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
      >
        Bạn đã hoàn thành challenge hôm nay.
      </p>
    </template>
  </div>
</template>
