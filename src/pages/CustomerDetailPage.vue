<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { formatDisplayDate, showRequestFailed } from '@/common'
import { useFormatCurrency } from '@/common/utils/format'
import SectionCard from '@/components/shared/SectionCard.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { fetchCustomerById } from '@/services/order.service'
import type { CustomerDetail } from '@/types/order'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const detail = ref<CustomerDetail | null>(null)
const isLoading = ref(false)

const formatCurrency = useFormatCurrency()

async function load(id: string) {
  isLoading.value = true
  detail.value = null
  try {
    detail.value = await fetchCustomerById(id)
  } catch {
    showRequestFailed(t('customers.loadDetailFailed'))
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void load(String(route.params.id))
})

watch(
  () => route.params.id,
  (id) => {
    if (id) void load(String(id))
  },
)
</script>

<template>
  <div v-if="isLoading" class="text-muted-foreground">
    {{ t('customers.loadingDetail') }}
  </div>

  <div v-else-if="detail" class="space-y-5">
    <div>
      <h2 class="text-xl font-bold">{{ detail.fullName }}</h2>
      <p class="text-sm text-muted-foreground">{{ detail.customerCode }}</p>
    </div>

    <SectionCard :title="t('customers.infoTitle')">
      <dl class="grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs text-muted-foreground">{{ t('customers.phoneLabel') }}</dt>
          <dd class="mt-1 font-medium">{{ detail.phone || '—' }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">{{ t('customers.emailLabel') }}</dt>
          <dd class="mt-1 font-medium">{{ detail.email || '—' }}</dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">{{ t('customers.totalSpentLabel') }}</dt>
          <dd class="mt-1 text-lg font-bold">
            {{ formatCurrency(detail.totalSpent) }}
          </dd>
        </div>
      </dl>
    </SectionCard>

    <SectionCard :title="t('customers.recentOrdersTitle')">
      <div v-if="!detail.orders.length" class="text-sm text-muted-foreground">
        {{ t('customers.noOrders') }}
      </div>
      <div v-else class="space-y-3">
        <button
          v-for="order in detail.orders"
          :key="order.id"
          type="button"
          class="flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition hover:border-primary/30"
          @click="router.push({ name: 'order-detail', params: { id: order.id } })"
        >
          <div class="min-w-0">
            <p class="truncate font-semibold">{{ order.orderCode }}</p>
            <p class="text-xs text-muted-foreground">
              {{ order.transactionCode }}
              <span v-if="order.createdAt">
                · {{ formatDisplayDate(order.createdAt) }}
              </span>
            </p>
          </div>
          <div class="text-right">
            <p class="font-semibold">{{ formatCurrency(order.amount) }}</p>
            <StatusBadge :status="order.status" class="mt-1" />
          </div>
        </button>
      </div>
    </SectionCard>

    <Button variant="outline" @click="router.push({ name: 'customers' })">
      {{ t('customers.backToList') }}
    </Button>
  </div>

  <div
    v-else
    class="rounded-xl border border-dashed p-10 text-center text-muted-foreground"
  >
    {{ t('customers.customerNotFound') }}
  </div>
</template>
