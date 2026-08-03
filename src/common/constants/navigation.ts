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
import i18n from '@/i18n'

const { t } = i18n.global

export type NavGroup = 'main' | 'management' | 'account'

export interface NavItem {
  name: string
  labelKey: string
  icon: LucideIcon
  group: NavGroup
  showInBottomNav?: boolean
  showInSidebar?: boolean
  comingSoon?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  {
    name: 'dashboard',
    labelKey: 'nav.dashboard',
    icon: LayoutDashboard,
    group: 'main',
    showInBottomNav: true,
    showInSidebar: true,
  },
  {
    name: 'transactions',
    labelKey: 'nav.transactions',
    icon: ArrowLeftRight,
    group: 'main',
    showInBottomNav: true,
    showInSidebar: true,
  },
  {
    name: 'orders',
    labelKey: 'nav.orders',
    icon: Package,
    group: 'main',
    showInBottomNav: true,
    showInSidebar: true,
  },
  {
    name: 'shipments',
    labelKey: 'nav.shipments',
    icon: Truck,
    group: 'main',
    showInBottomNav: true,
    showInSidebar: true,
  },
  {
    name: 'menu',
    labelKey: 'nav.menu',
    icon: Menu,
    group: 'main',
    showInBottomNav: true,
    showInSidebar: false,
  },
  {
    name: 'customers',
    labelKey: 'nav.customers',
    icon: Users,
    group: 'management',
    showInSidebar: true,
  },
  {
    name: 'payments',
    labelKey: 'nav.payments',
    icon: CreditCard,
    group: 'management',
    showInSidebar: true,
  },
  {
    name: 'statistics',
    labelKey: 'nav.statistics',
    icon: BarChart3,
    group: 'management',
    showInSidebar: true,
  },
  {
    name: 'history',
    labelKey: 'nav.history',
    icon: History,
    group: 'management',
    showInSidebar: true,
  },
  {
    name: 'news',
    labelKey: 'nav.news',
    icon: Newspaper,
    group: 'management',
    showInSidebar: true,
  },
  {
    name: 'profile',
    labelKey: 'nav.profile',
    icon: User,
    group: 'account',
    showInSidebar: true,
  },
  {
    name: 'settings',
    labelKey: 'nav.settings',
    icon: Settings,
    group: 'account',
    showInSidebar: true,
  },
]

export const BOTTOM_NAV_ITEMS = NAV_ITEMS.filter((item) => item.showInBottomNav)

export const SIDEBAR_NAV_GROUPS: { key: NavGroup; labelKey: string }[] = [
  { key: 'main', labelKey: 'nav.groupMain' },
  { key: 'management', labelKey: 'nav.groupManagement' },
  { key: 'account', labelKey: 'nav.groupAccount' },
]

const ROUTE_TITLE_KEYS: Record<string, string> = {
  dashboard: 'nav.dashboard',
  transactions: 'nav.transactions',
  orders: 'nav.orders',
  'order-detail': 'nav.orderDetail',
  shipments: 'nav.shipments',
  'shipment-detail': 'nav.shipmentDetail',
  menu: 'nav.menu',
  history: 'nav.history',
  statistics: 'nav.statistics',
  customers: 'nav.customers',
  'customer-detail': 'nav.customerDetail',
  payments: 'nav.payments',
  news: 'nav.news',
  'news-detail': 'nav.newsDetail',
  profile: 'nav.profile',
  settings: 'nav.settings',
}

export function getRouteTitle(routeName: string): string {
  const key = ROUTE_TITLE_KEYS[routeName]
  return key ? t(key) : t('app.appName')
}
