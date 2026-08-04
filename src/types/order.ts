export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed'
export type ShipmentStatus = 'pending' | 'in_transit' | 'delivered'

export interface OrderCustomer {
  id: string
  customerCode?: string
  fullName?: string
  phone?: string
  email?: string
  totalSpent?: number
}

export interface OrderListItem {
  id: string
  shopId: string
  orderCode: string
  transactionCode: string
  amount: number
  status: OrderStatus
  customer: OrderCustomer
  createdAt: string
}

export interface OrderPayment {
  id: string
  paymentCode: string
  amount: number
  status: PaymentStatus
  method?: string
}

export interface ShipmentMapPoint {
  lat?: number
  lng?: number
  label?: string
  cityId?: string
}

export interface ShipmentMapData {
  current: ShipmentMapPoint
  destination: ShipmentMapPoint
  currentCityId?: string
  destCityId?: string
  isMock?: boolean
}

export interface MapCity {
  id: string
  name: string
  region: string
  lat: number
  lng: number
}

export interface MapCitiesResponse {
  region: string
  source: string
  items: MapCity[]
}

export interface OrderShipmentSummary {
  id: string
  shipmentCode: string
  carrier?: string
  status: ShipmentStatus
  currentLocation?: string
  deliveryAddress?: string
  eta?: string
  map?: ShipmentMapData
  events?: ShipmentTrackingEvent[]
  timeline?: ShipmentTimelineStep[]
}

export interface OrderItem {
  id: string
  productId: string
  productCode: string
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface OrderDetail extends OrderListItem {
  batchId?: string
  submissionId?: string
  items: OrderItem[]
  payment: OrderPayment | null
  shipment: OrderShipmentSummary | null
  updatedAt?: string
}

export interface UpdateOrderPayload {
  status?: OrderStatus
  customer?: {
    fullName?: string
    phone?: string
    email?: string
  }
  shipment?: {
    status?: ShipmentStatus
    carrier?: string
    currentLocation?: string
    deliveryAddress?: string
    note?: string
    eta?: string
    currentCityId?: string
    destCityId?: string
  }
  items?: Array<{ productId: string; quantity: number }>
}

export interface ProductListItem {
  id: string
  productCode: string
  name: string
  price: number
  status: string
  isDefault?: boolean
}

export interface ProductListResponse {
  items: ProductListItem[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface OrderListResponse {
  items: OrderListItem[]
  meta: PaginationMeta
}

export interface ShipmentTrackingEvent {
  id: string
  status: ShipmentStatus
  location?: string
  note?: string
  createdAt?: string
}

export interface ShipmentListItem {
  id: string
  shipmentCode: string
  orderId: string
  orderCode?: string
  transactionCode?: string
  carrier?: string
  status: ShipmentStatus
  currentLocation?: string
  deliveryAddress?: string
  eta?: string
  createdAt?: string
}

export interface ShipmentTimelineStep {
  key?: string
  label: string
  done: boolean
  current: boolean
}

export interface ShipmentDetail extends ShipmentListItem {
  map?: ShipmentMapData
  events: ShipmentTrackingEvent[]
  timeline: ShipmentTimelineStep[]
  updatedAt?: string
}

export interface ShipmentListResponse {
  items: ShipmentListItem[]
  meta: PaginationMeta
}

export interface DashboardKpi {
  label: string
  value: number
  change?: number
  isCurrency?: boolean
}

export interface DashboardStatusItem {
  label: string
  value: number
  tone: 'warning' | 'success' | 'muted'
}

export interface DashboardRevenuePoint {
  date: string
  amount: number
}

export interface DashboardRecentOrder {
  id: string
  orderCode: string
  customer: string
  amount: number
  status: OrderStatus
}

export interface ShopDashboard {
  kpis: DashboardKpi[]
  statusSummary: DashboardStatusItem[]
  revenueTrend: DashboardRevenuePoint[]
  recentOrders: DashboardRecentOrder[]
}

export interface CustomerListItem {
  id: string
  shopId: string
  customerCode: string
  fullName: string
  phone?: string
  email?: string
  totalSpent: number
  createdAt?: string
}

export interface CustomerDetail extends CustomerListItem {
  orders: Array<{
    id: string
    orderCode: string
    transactionCode: string
    amount: number
    status: OrderStatus
    createdAt?: string
  }>
}

export interface CustomerListResponse {
  items: CustomerListItem[]
  meta: PaginationMeta
}

export interface PaymentListItem {
  id: string
  paymentCode: string
  orderId: string
  orderCode?: string
  transactionCode?: string
  amount: number
  status: PaymentStatus
  method?: string
  createdAt?: string
}

export interface PaymentListResponse {
  items: PaymentListItem[]
  meta: PaginationMeta
}
