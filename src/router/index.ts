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
          name: 'challenge',
          component: () => import('@/pages/ChallengePage.vue'),
        },
        {
          path: 'history',
          name: 'history',
          component: () => import('@/pages/HistoryPage.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'challenge' },
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
    return { name: 'challenge' }
  }

  return true
})

export default router
