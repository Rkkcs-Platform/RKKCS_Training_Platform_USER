<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NAV_ITEMS, SIDEBAR_NAV_GROUPS } from '@/common/constants/navigation'
import { showLogoutSuccess } from '@/common'
import MenuNavItem from '@/components/shared/MenuNavItem.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

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
  return NAV_ITEMS.filter((item) => item.group === group && item.name !== 'menu')
}

async function handleLogout() {
  await authStore.logout()
  showLogoutSuccess()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="space-y-5 lg:hidden">
    <Card class="overflow-hidden border-0 bg-primary text-primary-foreground shadow-md">
      <CardContent class="flex items-center gap-4 p-5">
        <div class="flex size-14 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
          {{ initials }}
        </div>
        <div>
          <p class="text-lg font-semibold">{{ authStore.user?.name }}</p>
          <p class="text-sm text-primary-foreground/80">Shop Owner</p>
        </div>
      </CardContent>
    </Card>

    <div v-for="group in SIDEBAR_NAV_GROUPS" :key="group.key" class="space-y-2">
      <p class="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {{ group.label }}
      </p>
      <div class="space-y-1 rounded-xl border bg-background p-2 shadow-sm">
        <MenuNavItem
          v-for="item in itemsForGroup(group.key)"
          :key="item.name"
          :item="item"
        />
      </div>
    </div>

    <Button
      variant="outline"
      class="h-11 w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
      @click="handleLogout"
    >
      <LogOut class="size-4" />
      Logout
    </Button>
  </div>
</template>
