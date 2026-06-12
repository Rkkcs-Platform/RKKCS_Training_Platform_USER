<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { MOCK_ORDERS, type OrderStatus } from '@/common/mocks/operations.mock'
import ComingSoonBanner from '@/components/shared/ComingSoonBanner.vue'
import OrderListItem from '@/components/shared/OrderListItem.vue'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const search = ref('')
const activeTab = ref<'all' | OrderStatus>('all')

const filteredOrders = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return MOCK_ORDERS.filter((order) => {
    const matchesTab = activeTab.value === 'all' || order.status === activeTab.value
    const matchesSearch =
      !keyword
      || order.id.toLowerCase().includes(keyword)
      || order.customerName.toLowerCase().includes(keyword)
      || order.transactionCode.toLowerCase().includes(keyword)

    return matchesTab && matchesSearch
  })
})
</script>

<template>
  <div class="space-y-5">
    <ComingSoonBanner />

    <div class="relative">
      <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        v-model="search"
        placeholder="Tìm đơn hàng, khách hàng, mã giao dịch..."
        class="h-11 pl-10"
      />
    </div>

    <Tabs v-model="activeTab" class="space-y-4">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="all">Tất cả</TabsTrigger>
        <TabsTrigger value="shipping">Shipping</TabsTrigger>
        <TabsTrigger value="delivered">Delivered</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
      </TabsList>
    </Tabs>

    <div class="space-y-3">
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
      Không tìm thấy đơn hàng
    </p>
  </div>
</template>
