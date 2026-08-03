<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  formatDisplayDate,
  formatDisplayTime,
  showHistoryDetailFailed,
  showHistoryLoadFailed,
} from '@/common'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useHistoryStore } from '@/stores/history'

const { t } = useI18n()
const historyStore = useHistoryStore()

onMounted(async () => {
  try {
    await historyStore.loadHistory()
  } catch {
    showHistoryLoadFailed()
  }
})

async function handleSelectDate(date: string) {
  try {
    await historyStore.selectDate(date)
  } catch {
    showHistoryDetailFailed()
  }
}
</script>

<template>
  <div class="space-y-5">
    <Card>
      <CardHeader>
        <CardTitle>{{ t('history.title') }}</CardTitle>
        <CardDescription>
          {{ t('history.description') }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="historyStore.isLoadingList" class="text-muted-foreground">
          {{ t('common.loading') }}
        </div>

        <div
          v-else-if="historyStore.items.length === 0"
          class="rounded-xl border border-dashed p-8 text-center text-muted-foreground"
        >
          {{ t('history.noHistory') }}
        </div>

        <template v-else>
        <div class="space-y-3 md:hidden">
          <button
            v-for="item in historyStore.items"
            :key="item.date"
            type="button"
            :class="
              cn(
                'w-full rounded-xl border p-4 text-left transition',
                historyStore.selectedDate === item.date
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50',
              )
            "
            @click="handleSelectDate(item.date)"
          >
            <div class="flex items-center justify-between gap-2">
              <p class="font-semibold">{{ formatDisplayDate(item.date) }}</p>
              <Badge :variant="item.status === 'completed' ? 'default' : 'secondary'">
                {{ item.status === 'completed' ? t('history.completed') : t('history.processing') }}
              </Badge>
            </div>
            <p class="mt-2 text-sm text-muted-foreground">
              {{ t('history.correctCodes', { count: item.correct }) }} · {{ t('history.wrongCodes', { count: item.wrong }) }} · {{ item.accuracy }}%
            </p>
          </button>
        </div>

        <div class="hidden overflow-hidden rounded-xl border md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{{ t('history.dateHeader') }}</TableHead>
                <TableHead>{{ t('history.correctHeader') }}</TableHead>
                <TableHead>{{ t('history.wrongHeader') }}</TableHead>
                <TableHead>{{ t('history.accuracyHeader') }}</TableHead>
                <TableHead>{{ t('history.statusHeader') }}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="item in historyStore.items"
                :key="item.date"
                :class="
                  cn(
                    'cursor-pointer',
                    historyStore.selectedDate === item.date && 'bg-muted/50',
                  )
                "
                @click="handleSelectDate(item.date)"
              >
                <TableCell class="font-medium">
                  {{ formatDisplayDate(item.date) }}
                </TableCell>
                <TableCell>{{ item.correct }}</TableCell>
                <TableCell>{{ item.wrong }}</TableCell>
                <TableCell>{{ item.accuracy }}%</TableCell>
                <TableCell>
                  <Badge :variant="item.status === 'completed' ? 'default' : 'secondary'">
                    {{ item.status === 'completed' ? t('history.completed') : t('history.missingCodes') }}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        </template>
      </CardContent>
    </Card>

    <Card v-if="historyStore.selectedDate">
      <CardHeader>
        <CardTitle>
          {{ t('history.detailTitle', { date: formatDisplayDate(historyStore.selectedDate) }) }}
        </CardTitle>
        <CardDescription v-if="historyStore.detail">
          {{ t('history.detailDescription', { submitted: historyStore.detail.submitted, correct: historyStore.detail.correct, wrong: historyStore.detail.wrong }) }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="historyStore.isLoadingDetail" class="text-muted-foreground">
          {{ t('common.loadingDetail') }}
        </div>

        <div
          v-else-if="!historyStore.detail?.answers.length"
          class="rounded-xl border border-dashed p-6 text-center text-muted-foreground"
        >
          {{ t('history.noCodesForDay') }}
        </div>

        <template v-else>
        <div class="space-y-3 md:hidden">
          <div
            v-for="answer in historyStore.detail!.answers"
            :key="`${answer.order}-${answer.inputCode}`"
            class="flex items-center justify-between rounded-xl border p-3"
          >
            <div>
              <p class="font-mono text-base font-semibold tracking-widest">
                {{ answer.inputCode }}
              </p>
              <p class="text-xs text-muted-foreground">
                #{{ answer.order }} · {{ formatDisplayTime(answer.submittedAt) }}
              </p>
            </div>
            <Badge :variant="answer.isCorrect ? 'default' : 'destructive'">
              {{ answer.isCorrect ? t('history.valid') : t('history.invalidShort') }}
            </Badge>
          </div>
        </div>

        <div class="hidden overflow-hidden rounded-xl border md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{{ t('history.codeHeader') }}</TableHead>
                <TableHead>{{ t('history.resultHeader') }}</TableHead>
                <TableHead>{{ t('history.timeHeader') }}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="answer in historyStore.detail!.answers"
                :key="`${answer.order}-${answer.inputCode}`"
              >
                <TableCell>{{ answer.order }}</TableCell>
                <TableCell class="font-mono font-semibold tracking-widest">
                  {{ answer.inputCode }}
                </TableCell>
                <TableCell>
                  <Badge :variant="answer.isCorrect ? 'default' : 'destructive'">
                    {{ answer.isCorrect ? t('history.validFull') : t('history.invalidFull') }}
                  </Badge>
                </TableCell>
                <TableCell>{{ formatDisplayTime(answer.submittedAt) }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
