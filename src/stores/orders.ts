import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  fetchOrderById,
  fetchOrders,
  fetchShipmentById,
  fetchShipments,
} from '@/services/order.service'
import type {
  OrderDetail,
  OrderListItem,
  PaginationMeta,
  ShipmentDetail,
  ShipmentListItem,
} from '@/types/order'

export const useOrdersStore = defineStore('orders', () => {
  const items = ref<OrderListItem[]>([])
  const meta = ref<PaginationMeta | null>(null)
  const detail = ref<OrderDetail | null>(null)
  const isLoadingList = ref(false)
  const isLoadingDetail = ref(false)

  async function loadOrders(params?: { page?: number; limit?: number }) {
    isLoadingList.value = true
    try {
      const data = await fetchOrders({ page: 1, limit: 100, ...params })
      items.value = data.items ?? []
      meta.value = data.meta ?? null
    } finally {
      isLoadingList.value = false
    }
  }

  async function loadOrderDetail(id: string) {
    isLoadingDetail.value = true
    detail.value = null
    try {
      detail.value = await fetchOrderById(id)
      return detail.value
    } finally {
      isLoadingDetail.value = false
    }
  }

  function clearDetail() {
    detail.value = null
  }

  return {
    items,
    meta,
    detail,
    isLoadingList,
    isLoadingDetail,
    loadOrders,
    loadOrderDetail,
    clearDetail,
  }
})

export const useShipmentsStore = defineStore('shipments', () => {
  const items = ref<ShipmentListItem[]>([])
  const meta = ref<PaginationMeta | null>(null)
  const detail = ref<ShipmentDetail | null>(null)
  const isLoadingList = ref(false)
  const isLoadingDetail = ref(false)

  async function loadShipments(params?: { page?: number; limit?: number }) {
    isLoadingList.value = true
    try {
      const data = await fetchShipments({ page: 1, limit: 100, ...params })
      items.value = data.items ?? []
      meta.value = data.meta ?? null
    } finally {
      isLoadingList.value = false
    }
  }

  async function loadShipmentDetail(id: string) {
    isLoadingDetail.value = true
    detail.value = null
    try {
      detail.value = await fetchShipmentById(id)
      return detail.value
    } finally {
      isLoadingDetail.value = false
    }
  }

  function clearDetail() {
    detail.value = null
  }

  return {
    items,
    meta,
    detail,
    isLoadingList,
    isLoadingDetail,
    loadShipments,
    loadShipmentDetail,
    clearDetail,
  }
})
