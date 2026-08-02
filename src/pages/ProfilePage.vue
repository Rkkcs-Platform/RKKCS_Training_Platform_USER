<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
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
    showRequestFailed(getErrorMessage(error) || 'Không tải được profile')
  } finally {
    isLoading.value = false
  }
}

async function handleSave() {
  if (!form.name.trim()) {
    showRequestFailed('Vui lòng nhập họ tên')
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
    showSuccess('Đã cập nhật profile')
  } catch (error) {
    showRequestFailed(getErrorMessage(error) || 'Cập nhật profile thất bại')
  } finally {
    isSaving.value = false
  }
}

async function handleChangePassword() {
  if (passwordForm.newPassword.length < 6) {
    showRequestFailed('Mật khẩu mới tối thiểu 6 ký tự')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showRequestFailed('Xác nhận mật khẩu không khớp')
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
    showSuccess('Đã đổi mật khẩu')
  } catch (error) {
    showRequestFailed(getErrorMessage(error) || 'Đổi mật khẩu thất bại')
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
    <SectionCard title="Profile" description="Thông tin tài khoản Shop Owner">
      <div v-if="isLoading" class="text-sm text-muted-foreground">Đang tải...</div>
      <div v-else class="grid gap-3 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-medium">Họ tên</label>
          <Input v-model="form.name" class="h-11" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Email</label>
          <Input v-model="form.email" class="h-11" disabled />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Staff code</label>
          <Input v-model="form.staffCode" class="h-11" disabled />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Avatar URL</label>
          <Input v-model="form.avatar" class="h-11" placeholder="https://..." />
        </div>
        <div class="sm:col-span-2">
          <Button :disabled="isSaving" @click="handleSave">
            {{ isSaving ? 'Đang lưu...' : 'Lưu profile' }}
          </Button>
        </div>
      </div>
    </SectionCard>

    <SectionCard title="Đổi mật khẩu">
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="space-y-2 sm:col-span-2">
          <label class="text-sm font-medium">Mật khẩu hiện tại</label>
          <Input
            v-model="passwordForm.currentPassword"
            type="password"
            class="h-11"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Mật khẩu mới</label>
          <Input
            v-model="passwordForm.newPassword"
            type="password"
            class="h-11"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Xác nhận mật khẩu mới</label>
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
            {{ isChangingPassword ? 'Đang đổi...' : 'Đổi mật khẩu' }}
          </Button>
        </div>
      </div>
    </SectionCard>
  </div>
</template>
