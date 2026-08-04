<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getErrorMessage, showRequestFailed, showSuccess } from '@/common'
import SectionCard from '@/components/shared/SectionCard.vue'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchMyShop, updateMyShop } from '@/services/phase5.service'

const { t } = useI18n()
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
    showRequestFailed(getErrorMessage(error) || t('settings.loadFailed'))
  } finally {
    isLoading.value = false
  }
}

async function handleSave() {
  if (!form.shopName.trim()) {
    showRequestFailed(t('settings.nameRequired'))
    return
  }
  isSaving.value = true
  try {
    const updated = await updateMyShop({ shopName: form.shopName.trim() })
    form.shopName = updated.shopName
    form.status = updated.status
    showSuccess(t('settings.shopUpdated'))
  } catch (error) {
    showRequestFailed(getErrorMessage(error) || t('settings.shopUpdateFailed'))
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
      :title="t('settings.title')"
      :description="t('settings.description')"
    >
      <div v-if="isLoading" class="text-sm text-muted-foreground">{{ t('common.loading') }}</div>
      <div v-else class="grid gap-3 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('settings.shopCodeLabel') }}</label>
          <Input v-model="form.shopCode" class="h-11" disabled />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('settings.statusLabel') }}</label>
          <Input v-model="form.status" class="h-11" disabled />
        </div>
        <div class="space-y-2 sm:col-span-2">
          <label class="text-sm font-medium">{{ t('settings.shopNameLabel') }}</label>
          <Input v-model="form.shopName" class="h-11" />
        </div>
        <div>
          <Button :disabled="isSaving" @click="handleSave">
            {{ isSaving ? t('settings.savingSettings') : t('settings.saveSettings') }}
          </Button>
        </div>
      </div>
    </SectionCard>

    <SectionCard
      :title="t('settings.languageTitle')"
      :description="t('settings.languageDescription')"
    >
      <LanguageSwitcher />
    </SectionCard>
  </div>
</template>
