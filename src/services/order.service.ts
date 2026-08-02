import type {
  CustomerDetail,
  CustomerListResponse,
  MapCitiesResponse,
  OrderDetail,
  OrderListResponse,
  PaymentListItem,
  PaymentListResponse,
  ProductListResponse,
  ShipmentDetail,
  ShipmentListResponse,
  ShopDashboard,
  UpdateOrderPayload,
} from '@/types/order'
import { api } from './api'

export async function fetchDashboard() {
  const { data } = await api.get<ShopDashboard>('/dashboard')
  return data
}

export async function fetchMapCities(region?: string) {
  const { data } = await api.get<MapCitiesResponse>('/map/cities', {
    params: region ? { region } : undefined,
  })
  return data
}

export async function fetchOrders(params?: { page?: number; limit?: number }) {
  const { data } = await api.get<OrderListResponse>('/orders', { params })
  return data
}

export async function fetchOrderById(id: string) {
  const { data } = await api.get<OrderDetail>(`/orders/${id}`)
  return data
}

export async function updateOrder(id: string, payload: UpdateOrderPayload) {
  const { data } = await api.patch<OrderDetail>(`/orders/${id}`, payload)
  return data
}

export async function fetchProducts(params?: {
  page?: number
  limit?: number
}) {
  const { data } = await api.get<ProductListResponse>('/products', { params })
  return data
}

export async function fetchShipments(params?: {
  page?: number
  limit?: number
}) {
  const { data } = await api.get<ShipmentListResponse>('/shipments', {
    params,
  })
  return data
}

export async function fetchShipmentById(id: string) {
  const { data } = await api.get<ShipmentDetail>(`/shipments/${id}`)
  return data
}

export async function fetchCustomers(params?: {
  page?: number
  limit?: number
}) {
  const { data } = await api.get<CustomerListResponse>('/customers', {
    params,
  })
  return data
}

export async function fetchCustomerById(id: string) {
  const { data } = await api.get<CustomerDetail>(`/customers/${id}`)
  return data
}

export async function fetchPayments(params?: {
  page?: number
  limit?: number
}) {
  const { data } = await api.get<PaymentListResponse>('/payments', { params })
  return data
}

export async function fetchPaymentById(id: string) {
  const { data } = await api.get<PaymentListItem>(`/payments/${id}`)
  return data
}
