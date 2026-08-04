import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
} from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { setLocale, type AppLocale } from '@/i18n'

function routeRequiresAuth(to: RouteLocationNormalized) {
  return to.matched.some((record) => record.meta.requiresAuth)
}

function routeIsGuestOnly(to: RouteLocationNormalized) {
  return to.matched.some((record) => record.meta.guestOnly)
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/pages/DashboardPage.vue'),
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: () => import('@/pages/TransactionPage.vue'),
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('@/pages/OrdersPage.vue'),
        },
        {
          path: 'orders/:id',
          name: 'order-detail',
          component: () => import('@/pages/OrderDetailPage.vue'),
        },
        {
          path: 'shipments',
          name: 'shipments',
          component: () => import('@/pages/ShipmentsPage.vue'),
        },
        {
          path: 'shipments/:id',
          name: 'shipment-detail',
          component: () => import('@/pages/ShipmentDetailPage.vue'),
        },
        {
          path: 'menu',
          name: 'menu',
          component: () => import('@/pages/MenuPage.vue'),
        },
        {
          path: 'history',
          name: 'history',
          component: () => import('@/pages/HistoryPage.vue'),
        },
        {
          path: 'statistics',
          name: 'statistics',
          component: () => import('@/pages/StatisticsPage.vue'),
        },
        {
          path: 'customers',
          name: 'customers',
          component: () => import('@/pages/CustomersPage.vue'),
        },
        {
          path: 'customers/:id',
          name: 'customer-detail',
          component: () => import('@/pages/CustomerDetailPage.vue'),
        },
        {
          path: 'payments',
          name: 'payments',
          component: () => import('@/pages/PaymentsPage.vue'),
        },
        {
          path: 'news',
          name: 'news',
          component: () => import('@/pages/NewsPage.vue'),
        },
        {
          path: 'news/:slug',
          name: 'news-detail',
          component: () => import('@/pages/NewsDetailPage.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/pages/ProfilePage.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/pages/SettingsPage.vue'),
        },
        // Legacy redirect
        {
          path: 'challenge',
          redirect: { name: 'transactions' },
        },
      ],
    },
    {
      path: '/maintenance',
      name: 'maintenance',
      component: () => import('@/pages/MaintenancePage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'dashboard' },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Skip maintenance check for maintenance page itself and login
  if (to.name !== 'maintenance' && to.name !== 'login') {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/setting/maintenance`,
      )
      const data = await res.json()
      if (data.language && !sessionStorage.getItem('rkkcs-lang-initialized')) {
        setLocale(data.language as AppLocale)
      }
      if (data.maintenance) {
        return { name: 'maintenance' }
      }
    } catch {
      // API down — don't block navigation
    }
  }

  // If on maintenance page but maintenance is off, redirect to dashboard
  if (to.name === 'maintenance') {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/setting/maintenance`,
      )
      const data = await res.json()
      if (data.language && !sessionStorage.getItem('rkkcs-lang-initialized')) {
        setLocale(data.language as AppLocale)
      }
      if (!data.maintenance) {
        return { name: 'dashboard' }
      }
    } catch {
      // API down — stay on maintenance
    }
    return true
  }

  if (routeRequiresAuth(to) && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (routeIsGuestOnly(to) && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
