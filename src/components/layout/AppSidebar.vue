<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NAV_ITEMS,
  SIDEBAR_NAV_GROUPS,
} from '@/common/constants/navigation'
import { APP_LABELS } from '@/common/constants/messages'
import { showLogoutSuccess } from '@/common'
import MenuNavItem from '@/components/shared/MenuNavItem.vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  open?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const initials = computed(() => {
  const name = authStore.user?.name ?? 'U'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

function itemsForGroup(group: string) {
  return NAV_ITEMS.filter((item) => item.showInSidebar && item.group === group)
}

async function handleLogout() {
  await authStore.logout()
  showLogoutSuccess()
  emit('close')
  router.push({ name: 'login' })
}

function handleNavigate() {
  emit('close')
}
</script>

<template>
  <aside
    :class="
      cn(
        'flex h-full w-72 shrink-0 flex-col border-r bg-background',
        'fixed inset-y-0 left-0 z-50 transition-transform lg:static lg:z-auto lg:translate-x-0',
        props.open ? 'translate-x-0' : '-translate-x-full',
      )
    "
  >
    <div class="border-b p-5">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {{ APP_LABELS.brandShort }}
      </p>
      <p class="mt-1 text-lg font-bold">{{ APP_LABELS.appName }}</p>
    </div>

    <div class="border-b bg-primary p-4 text-primary-foreground">
      <div class="flex items-center gap-3">
        <div class="flex size-11 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
          {{ initials }}
        </div>
        <div class="min-w-0">
          <p class="truncate font-semibold">{{ authStore.user?.name }}</p>
          <p class="text-xs text-primary-foreground/80">Nhân viên vận hành - CN Hà Nội</p>
        </div>
      </div>
    </div>

    <div class="flex-1 space-y-5 overflow-y-auto p-4" @click="handleNavigate">
      <div v-for="group in SIDEBAR_NAV_GROUPS" :key="group.key">
        <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {{ group.label }}
        </p>
        <div class="space-y-1">
          <MenuNavItem
            v-for="item in itemsForGroup(group.key)"
            :key="item.name"
            :item="item"
            :active="route.name === item.name"
          />
        </div>
      </div>
    </div>

    <div class="border-t p-4">
      <Button
        variant="ghost"
        class="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
        @click="handleLogout"
      >
        <LogOut class="size-4" />
        Logout
      </Button>
    </div>
  </aside>
</template>
