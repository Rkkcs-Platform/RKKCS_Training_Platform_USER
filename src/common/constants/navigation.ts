import type { LucideIcon } from 'lucide-vue-next'
import {
  ArrowLeftRight,
  BarChart3,
  CreditCard,
  History,
  LayoutDashboard,
  Menu,
  Newspaper,
  Package,
  Settings,
  Truck,
  User,
  Users,
} from 'lucide-vue-next'

export type NavGroup = 'main' | 'management' | 'account'

export interface NavItem {
  name: string
  label: string
  icon: LucideIcon
  group: NavGroup
  showInBottomNav?: boolean
  showInSidebar?: boolean
  comingSoon?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    group: 'main',
    showInBottomNav: true,
    showInSidebar: true,
  },
  {
    name: 'transactions',
    label: 'Transaction Center',
    icon: ArrowLeftRight,
    group: 'main',
    showInBottomNav: true,
    showInSidebar: true,
  },
  {
    name: 'orders',
    label: 'Orders',
    icon: Package,
    group: 'main',
    showInBottomNav: true,
    showInSidebar: true,
  },
  {
    name: 'shipments',
    label: 'Shipments',
    icon: Truck,
    group: 'main',
    showInBottomNav: true,
    showInSidebar: true,
  },
  {
    name: 'menu',
    label: 'Menu',
    icon: Menu,
    group: 'main',
    showInBottomNav: true,
    showInSidebar: false,
  },
  {
    name: 'customers',
    label: 'Customers',
    icon: Users,
    group: 'management',
    showInSidebar: true,
  },
  {
    name: 'payments',
    label: 'Payments',
    icon: CreditCard,
    group: 'management',
    showInSidebar: true,
  },
  {
    name: 'statistics',
    label: 'Statistics',
    icon: BarChart3,
    group: 'management',
    showInSidebar: true,
  },
  {
    name: 'history',
    label: 'Lịch sử nhập mã',
    icon: History,
    group: 'management',
    showInSidebar: true,
  },
  {
    name: 'news',
    label: 'News',
    icon: Newspaper,
    group: 'management',
    showInSidebar: true,
  },
  {
    name: 'profile',
    label: 'Profile',
    icon: User,
    group: 'account',
    showInSidebar: true,
  },
  {
    name: 'settings',
    label: 'Settings',
    icon: Settings,
    group: 'account',
    showInSidebar: true,
  },
]

export const BOTTOM_NAV_ITEMS = NAV_ITEMS.filter((item) => item.showInBottomNav)

export const SIDEBAR_NAV_GROUPS: { key: NavGroup; label: string }[] = [
  { key: 'main', label: 'Vận hành' },
  { key: 'management', label: 'Quản lý' },
  { key: 'account', label: 'Tài khoản' },
]

export const ROUTE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  transactions: 'Transaction Center',
  orders: 'Orders',
  'order-detail': 'Order Detail',
  shipments: 'Shipments',
  'shipment-detail': 'Shipment Tracking',
  menu: 'Menu',
  history: 'Lịch sử nhập mã',
  statistics: 'Statistics',
  customers: 'Customers',
  'customer-detail': 'Customer Detail',
  payments: 'Payments',
  news: 'News',
  'news-detail': 'News Detail',
  profile: 'Profile',
  settings: 'Settings',
}
