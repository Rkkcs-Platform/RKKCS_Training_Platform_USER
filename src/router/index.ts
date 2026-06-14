import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
} from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
          component: () => import('@/pages/ComingSoonPage.vue'),
        },
        {
          path: 'payments',
          name: 'payments',
          component: () => import('@/pages/ComingSoonPage.vue'),
        },
        {
          path: 'news',
          name: 'news',
          component: () => import('@/pages/ComingSoonPage.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/pages/ComingSoonPage.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/pages/ComingSoonPage.vue'),
        },
        // Legacy redirect
        {
          path: 'challenge',
          redirect: { name: 'transactions' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'dashboard' },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

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
