<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getErrorMessage, showRequestFailed, showSuccess } from '@/common'
import SectionCard from '@/components/shared/SectionCard.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchMyShop, updateMyShop } from '@/services/phase5.service'

const isLoading = ref(false)
const isSaving = ref(false)
const form = reactive({
  shopCode: '',
  shopName: '',
  status: '',
})

async function load() {
  isLoading.value = true
  try {
    const shop = await fetchMyShop()
    form.shopCode = shop.shopCode
    form.shopName = shop.shopName
    form.status = shop.status
  } catch (error) {
    showRequestFailed(getErrorMessage(error) || 'Không tải được shop settings')
  } finally {
    isLoading.value = false
  }
}

async function handleSave() {
  if (!form.shopName.trim()) {
    showRequestFailed('Vui lòng nhập tên shop')
    return
  }
  isSaving.value = true
  try {
    const updated = await updateMyShop({ shopName: form.shopName.trim() })
    form.shopName = updated.shopName
    form.status = updated.status
    showSuccess('Đã cập nhật shop')
  } catch (error) {
    showRequestFailed(getErrorMessage(error) || 'Cập nhật shop thất bại')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <div class="space-y-4">
    <SectionCard
      title="Shop settings"
      description="Cấu hình thông tin shop của bạn"
    >
      <div v-if="isLoading" class="text-sm text-muted-foreground">Đang tải...</div>
      <div v-else class="grid gap-3 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-medium">Shop code</label>
          <Input v-model="form.shopCode" class="h-11" disabled />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Status</label>
          <Input v-model="form.status" class="h-11" disabled />
        </div>
        <div class="space-y-2 sm:col-span-2">
          <label class="text-sm font-medium">Tên shop</label>
          <Input v-model="form.shopName" class="h-11" />
        </div>
        <div>
          <Button :disabled="isSaving" @click="handleSave">
            {{ isSaving ? 'Đang lưu...' : 'Lưu settings' }}
          </Button>
        </div>
      </div>
    </SectionCard>
  </div>
</template>
