<script setup lang="ts">
import { onMounted } from 'vue'
import { PAGE_LABELS } from '@/common/constants/messages'
import { showError } from '@/common/utils/toast'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useStatisticsStore } from '@/stores/statistics'

const labels = PAGE_LABELS.statistics
const statisticsStore = useStatisticsStore()

async function loadData() {
  try {
    await statisticsStore.loadStatistics()
  } catch {
    showError(labels.loadFailed)
  }
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <div class="space-y-5">
    <Card>
      <CardHeader>
        <CardTitle>{{ labels.title }}</CardTitle>
        <CardDescription>{{ labels.description }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="statisticsStore.isLoading" class="text-muted-foreground">
          Đang tải...
        </div>

        <div
          v-else-if="statisticsStore.loadFailed"
          class="space-y-4 rounded-xl border border-dashed p-8 text-center"
        >
          <p class="text-muted-foreground">{{ labels.loadFailed }}</p>
          <Button variant="outline" @click="loadData">
            Thử lại
          </Button>
        </div>

        <div
          v-else-if="statisticsStore.stats"
          class="grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          <div class="rounded-xl border bg-muted/40 p-4">
            <p class="text-xs text-muted-foreground">{{ labels.totalDays }}</p>
            <p class="mt-1 text-2xl font-bold">
              {{ statisticsStore.stats.totalChallenges }}
            </p>
          </div>
          <div class="rounded-xl border bg-muted/40 p-4">
            <p class="text-xs text-muted-foreground">{{ labels.completedDays }}</p>
            <p class="mt-1 text-2xl font-bold">
              {{ statisticsStore.stats.completedChallenges }}
            </p>
          </div>
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
            <p class="text-xs text-emerald-600">{{ labels.totalCorrect }}</p>
            <p class="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {{ statisticsStore.stats.totalCorrect }}
            </p>
          </div>
          <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/40">
            <p class="text-xs text-rose-600">{{ labels.totalWrong }}</p>
            <p class="mt-1 text-2xl font-bold text-rose-700 dark:text-rose-400">
              {{ statisticsStore.stats.totalWrong }}
            </p>
          </div>
          <div class="rounded-xl border bg-muted/40 p-4">
            <p class="text-xs text-muted-foreground">{{ labels.accuracy }}</p>
            <p class="mt-1 text-2xl font-bold">
              {{ statisticsStore.stats.accuracy }}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
