<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { showRequestFailed } from '@/common'
import OrderListItem from '@/components/shared/OrderListItem.vue'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useOrdersStore } from '@/stores/orders'
import type { OrderStatus } from '@/types/order'

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
    showRequestFailed('Không tải được danh sách đơn hàng')
  }
})
</script>

<template>
  <div class="space-y-5">
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
        <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
        <TabsTrigger value="shipping">Shipping</TabsTrigger>
        <TabsTrigger value="delivered">Delivered</TabsTrigger>
      </TabsList>
    </Tabs>

    <div v-if="ordersStore.isLoadingList" class="text-muted-foreground">
      Đang tải đơn hàng...
    </div>

    <template v-else>
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
    </template>
  </div>
</template>
