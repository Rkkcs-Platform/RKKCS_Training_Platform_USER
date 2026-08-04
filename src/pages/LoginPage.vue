<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { APP_LABELS } from '@/common/constants/messages'
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
import LanguageSwitcher from '@/components/shared/LanguageSwitcher.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

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

    await router.replace({ name: 'dashboard' })
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
      <div class="flex justify-end">
        <LanguageSwitcher />
      </div>

      <div class="text-center">
        <p class="text-xs font-medium uppercase tracking-[0.25em] text-primary">
          {{ APP_LABELS.brandShort }}
        </p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {{ APP_LABELS.appName }}
        </h1>
        <p class="mt-2 text-sm text-muted-foreground sm:text-base">
          {{ t('auth.loginSubtitle') }}
        </p>
      </div>

      <Card class="shadow-sm">
        <CardHeader>
          <CardTitle>{{ t('auth.loginCardTitle') }}</CardTitle>
          <CardDescription>{{ t('auth.loginCardDescription') }}</CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div class="space-y-2">
              <label class="text-sm font-medium" for="email">{{ t('auth.emailLabel') }}</label>
              <Input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                :placeholder="t('auth.emailPlaceholder')"
                class="h-11"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium" for="password">{{ t('auth.passwordLabel') }}</label>
              <Input
                id="password"
                v-model="password"
                type="password"
                autocomplete="current-password"
                :placeholder="t('auth.passwordPlaceholder')"
                class="h-11"
              />
            </div>

            <Button type="submit" class="h-11 w-full" :disabled="isSubmitting">
              {{ isSubmitting ? t('auth.loggingIn') : t('auth.loginButton') }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
