export type OrderStatus = 'pending' | 'shipping' | 'delivered' | 'cancelled'
export type ShipmentStatus = 'pending' | 'in_transit' | 'delivered'

export interface MockOrder {
  id: string
  transactionCode: string
  customerName: string
  amount: number
  status: OrderStatus
  createdAt: string
  phone: string
  email: string
  address: string
  paymentMethod: string
  paymentStatus: 'paid' | 'unpaid'
  shipmentId?: string
  carrier?: string
}

export interface MockShipment {
  id: string
  orderId: string
  transactionCode: string
  carrier: string
  status: ShipmentStatus
  eta: string
  timeline: { label: string; done: boolean; current?: boolean }[]
}

export const MOCK_DASHBOARD = {
  kpis: [
    { label: 'Transactions', value: 128, change: 12 },
    { label: 'Orders', value: 86, change: 8 },
    { label: 'Customers', value: 54, change: 5 },
    { label: 'Revenue', value: '₫24.5M', change: 15, isCurrency: true },
  ],
  statusSummary: [
    { label: 'Pending Shipments', value: 12, tone: 'warning' as const },
    { label: 'Delivered', value: 68, tone: 'success' as const },
    { label: 'Return / Cancelled', value: 6, tone: 'muted' as const },
  ],
  revenueTrend: [12, 15, 14, 18, 20, 22, 24.5],
  recentOrders: [
    { id: 'ORD-20260611-001', customer: 'Nguyễn Văn A', amount: '₫350,000', status: 'shipping' as OrderStatus },
    { id: 'ORD-20260611-002', customer: 'Trần Thị B', amount: '₫520,000', status: 'delivered' as OrderStatus },
    { id: 'ORD-20260610-015', customer: 'Lê Văn C', amount: '₫180,000', status: 'pending' as OrderStatus },
  ],
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'ORD-20260611-001',
    transactionCode: 'TXN-AVB12345',
    customerName: 'Nguyễn Văn A',
    amount: 350000,
    status: 'shipping',
    createdAt: '2026-06-11T09:30:00',
    phone: '0901234567',
    email: 'nguyenvana@email.com',
    address: '123 Nguyễn Huệ, Q1, TP.HCM',
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'paid',
    shipmentId: 'SHP-20260611-001',
    carrier: 'Giao Hàng Nhanh',
  },
  {
    id: 'ORD-20260611-002',
    transactionCode: 'TXN-CDE67890',
    customerName: 'Trần Thị B',
    amount: 520000,
    status: 'delivered',
    createdAt: '2026-06-11T08:15:00',
    phone: '0912345678',
    email: 'tranthib@email.com',
    address: '45 Lê Lợi, Q3, TP.HCM',
    paymentMethod: 'COD',
    paymentStatus: 'paid',
    shipmentId: 'SHP-20260611-002',
    carrier: 'Viettel Post',
  },
  {
    id: 'ORD-20260610-015',
    transactionCode: 'TXN-FGH11223',
    customerName: 'Lê Văn C',
    amount: 180000,
    status: 'pending',
    createdAt: '2026-06-10T16:45:00',
    phone: '0923456789',
    email: 'levanc@email.com',
    address: '78 Hai Bà Trưng, Q1, TP.HCM',
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'unpaid',
  },
  {
    id: 'ORD-20260610-012',
    transactionCode: 'TXN-IJK44556',
    customerName: 'Phạm Thị D',
    amount: 890000,
    status: 'cancelled',
    createdAt: '2026-06-10T11:20:00',
    phone: '0934567890',
    email: 'phamthid@email.com',
    address: '12 Võ Văn Tần, Q3, TP.HCM',
    paymentMethod: 'COD',
    paymentStatus: 'unpaid',
  },
]

export const MOCK_SHIPMENTS: MockShipment[] = [
  {
    id: 'SHP-20260611-001',
    orderId: 'ORD-20260611-001',
    transactionCode: 'TXN-AVB12345',
    carrier: 'Giao Hàng Nhanh',
    status: 'in_transit',
    eta: '2026-06-13',
    timeline: [
      { label: 'Đơn hàng được tạo', done: true },
      { label: 'Đã lấy hàng', done: true },
      { label: 'Đến trung tâm phân loại', done: true },
      { label: 'Đang vận chuyển', done: false, current: true },
      { label: 'Giao hàng thành công', done: false },
    ],
  },
  {
    id: 'SHP-20260611-002',
    orderId: 'ORD-20260611-002',
    transactionCode: 'TXN-CDE67890',
    carrier: 'Viettel Post',
    status: 'delivered',
    eta: '2026-06-12',
    timeline: [
      { label: 'Đơn hàng được tạo', done: true },
      { label: 'Đã lấy hàng', done: true },
      { label: 'Đến trung tâm phân loại', done: true },
      { label: 'Đang vận chuyển', done: true },
      { label: 'Giao hàng thành công', done: true, current: true },
    ],
  },
]

export function getMockOrder(id: string) {
  return MOCK_ORDERS.find((order) => order.id === id)
}

export function getMockShipment(id: string) {
  return MOCK_SHIPMENTS.find((shipment) => shipment.id === id)
}
