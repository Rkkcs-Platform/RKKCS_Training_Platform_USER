<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getErrorMessage, showRequestFailed, showSuccess } from '@/common'
import SectionCard from '@/components/shared/SectionCard.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  changePassword,
  fetchProfile,
  updateProfile,
} from '@/services/phase5.service'
import { useAuthStore } from '@/stores/auth'
import { setStoredUser } from '@/common/utils/storage'

const { t } = useI18n()
const authStore = useAuthStore()
const isLoading = ref(false)
const isSaving = ref(false)
const isChangingPassword = ref(false)

const form = reactive({
  name: '',
  email: '',
  staffCode: '',
  avatar: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

async function load() {
  isLoading.value = true
  try {
    const profile = await fetchProfile()
    form.name = profile.name || ''
    form.email = profile.email || ''
    form.staffCode = profile.staffCode || ''
    form.avatar = profile.avatar || ''
    authStore.user = profile
    setStoredUser(profile)
  } catch (error) {
    showRequestFailed(getErrorMessage(error) || t('profile.loadFailed'))
  } finally {
    isLoading.value = false
  }
}

async function handleSave() {
  if (!form.name.trim()) {
    showRequestFailed(t('profile.nameRequired'))
    return
  }
  isSaving.value = true
  try {
    const updated = await updateProfile({
      name: form.name.trim(),
      avatar: form.avatar.trim() || undefined,
    })
    authStore.user = updated
    setStoredUser(updated)
    showSuccess(t('profile.profileUpdated'))
  } catch (error) {
    showRequestFailed(getErrorMessage(error) || t('profile.profileUpdateFailed'))
  } finally {
    isSaving.value = false
  }
}

async function handleChangePassword() {
  if (passwordForm.newPassword.length < 6) {
    showRequestFailed(t('profile.passwordMinLength'))
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showRequestFailed(t('profile.passwordMismatch'))
    return
  }
  isChangingPassword.value = true
  try {
    await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    showSuccess(t('profile.passwordChanged'))
  } catch (error) {
    showRequestFailed(getErrorMessage(error) || t('profile.passwordChangeFailed'))
  } finally {
    isChangingPassword.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <div class="space-y-4">
    <SectionCard :title="t('profile.title')" :description="t('profile.description')">
      <div v-if="isLoading" class="text-sm text-muted-foreground">{{ t('common.loading') }}</div>
      <div v-else class="grid gap-3 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('profile.fullNameLabel') }}</label>
          <Input v-model="form.name" class="h-11" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('profile.emailLabel') }}</label>
          <Input v-model="form.email" class="h-11" disabled />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('profile.staffCodeLabel') }}</label>
          <Input v-model="form.staffCode" class="h-11" disabled />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('profile.avatarLabel') }}</label>
          <Input v-model="form.avatar" class="h-11" :placeholder="t('profile.avatarPlaceholder')" />
        </div>
        <div class="sm:col-span-2">
          <Button :disabled="isSaving" @click="handleSave">
            {{ isSaving ? t('profile.savingProfile') : t('profile.saveProfile') }}
          </Button>
        </div>
      </div>
    </SectionCard>

    <SectionCard :title="t('profile.changePasswordTitle')">
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="space-y-2 sm:col-span-2">
          <label class="text-sm font-medium">{{ t('profile.currentPasswordLabel') }}</label>
          <Input
            v-model="passwordForm.currentPassword"
            type="password"
            class="h-11"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('profile.newPasswordLabel') }}</label>
          <Input
            v-model="passwordForm.newPassword"
            type="password"
            class="h-11"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('profile.confirmPasswordLabel') }}</label>
          <Input
            v-model="passwordForm.confirmPassword"
            type="password"
            class="h-11"
          />
        </div>
        <div class="sm:col-span-2">
          <Button
            :disabled="isChangingPassword"
            variant="outline"
            @click="handleChangePassword"
          >
            {{ isChangingPassword ? t('profile.changingPassword') : t('profile.changePasswordButton') }}
          </Button>
        </div>
      </div>
    </SectionCard>
  </div>
</template>
