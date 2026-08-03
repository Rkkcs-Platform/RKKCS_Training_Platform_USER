<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { showRequestFailed } from '@/common'
import OrderListItem from '@/components/shared/OrderListItem.vue'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useOrdersStore } from '@/stores/orders'
import type { OrderStatus } from '@/types/order'

const { t } = useI18n()
const ordersStore = useOrdersStore()
const search = ref('')
const activeTab = ref<'all' | OrderStatus>('all')

const filteredOrders = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return ordersStore.items.filter((order) => {
    const matchesTab = activeTab.value === 'all' || order.status === activeTab.value
    const customerName = (
      order.customer.fullName
      || order.customer.customerCode
      || ''
    ).toLowerCase()

    const matchesSearch =
      !keyword
      || order.orderCode.toLowerCase().includes(keyword)
      || order.transactionCode.toLowerCase().includes(keyword)
      || customerName.includes(keyword)

    return matchesTab && matchesSearch
  })
})

onMounted(async () => {
  try {
    await ordersStore.loadOrders()
  } catch {
    showRequestFailed(t('orders.loadFailed'))
  }
})
</script>

<template>
  <div class="space-y-5">
    <div class="relative">
      <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        v-model="search"
        :placeholder="t('orders.searchPlaceholder')"
        class="h-11 pl-10"
      />
    </div>

    <Tabs v-model="activeTab" class="space-y-4">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="all">{{ t('orders.tabAll') }}</TabsTrigger>
        <TabsTrigger value="confirmed">{{ t('orders.tabConfirmed') }}</TabsTrigger>
        <TabsTrigger value="shipping">{{ t('orders.tabShipping') }}</TabsTrigger>
        <TabsTrigger value="delivered">{{ t('orders.tabDelivered') }}</TabsTrigger>
      </TabsList>
    </Tabs>

    <div v-if="ordersStore.isLoadingList" class="text-muted-foreground">
      {{ t('orders.loadingOrders') }}
    </div>

    <template v-else>
      <div class="space-y-4">
        <OrderListItem
          v-for="order in filteredOrders"
          :key="order.id"
          :order="order"
        />
      </div>

      <p
        v-if="!filteredOrders.length"
        class="rounded-xl border border-dashed p-8 text-center text-muted-foreground"
      >
        {{ t('orders.noOrders') }}
      </p>
    </template>
  </div>
</template>
