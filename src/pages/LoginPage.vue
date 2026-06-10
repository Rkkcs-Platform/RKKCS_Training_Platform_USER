<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getErrorMessage,
  showLoginFailed,
  showLoginSuccess,
  showMissingCredentials,
} from '@/common'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  if (!email.value.trim() || !password.value) {
    showMissingCredentials()
    return
  }

  isSubmitting.value = true

  try {
    await authStore.login({
      email: email.value.trim(),
      password: password.value,
    })

    showLoginSuccess()

    const redirect = route.query.redirect

    if (typeof redirect === 'string' && redirect.startsWith('/')) {
      await router.replace(redirect)
      return
    }

    await router.replace({ name: 'challenge' })
  } catch (error) {
    showLoginFailed(getErrorMessage(error))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-svh items-center justify-center bg-background px-4 py-8">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center">
        <p class="text-xs font-medium uppercase tracking-[0.25em] text-primary">
          RKKCS
        </p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Brain Training
        </h1>
        <p class="mt-2 text-sm text-muted-foreground sm:text-base">
          Đăng nhập để nhập mã hằng ngày
        </p>
      </div>

      <Card class="shadow-sm">
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>Nhập tài khoản được cấp để tiếp tục</CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div class="space-y-2">
              <label class="text-sm font-medium" for="email">Email</label>
              <Input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="user@gmail.com"
                class="h-11"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium" for="password">Mật khẩu</label>
              <Input
                id="password"
                v-model="password"
                type="password"
                autocomplete="current-password"
                placeholder="••••••"
                class="h-11"
              />
            </div>

            <Button type="submit" class="h-11 w-full" :disabled="isSubmitting">
              {{ isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
