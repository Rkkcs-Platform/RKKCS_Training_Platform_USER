<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { getErrorMessage, showRequestFailed } from '@/common'
import SectionCard from '@/components/shared/SectionCard.vue'
import { Button } from '@/components/ui/button'
import { fetchNewsBySlug, type NewsItem } from '@/services/phase5.service'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isLoading = ref(false)
const item = ref<NewsItem | null>(null)

function formatDate(value?: string) {
  if (!value) return ''
  return new Date(value).toLocaleString('vi-VN')
}

async function load(slug: string) {
  isLoading.value = true
  item.value = null
  try {
    item.value = await fetchNewsBySlug(slug)
  } catch (error) {
    showRequestFailed(getErrorMessage(error) || t('news.loadDetailFailed'))
  } finally {
    isLoading.value = false
  }
}

watch(
  () => route.params.slug,
  (slug) => {
    if (typeof slug === 'string' && slug) void load(slug)
  },
)

onMounted(() => {
  const slug = String(route.params.slug || '')
  if (slug) void load(slug)
})
</script>

<template>
  <div class="space-y-4">
    <Button variant="outline" size="sm" @click="router.push({ name: 'news' })">
      {{ t('news.backToNews') }}
    </Button>

    <SectionCard
      :title="item?.title || t('news.detailTitle')"
      :description="item ? formatDate(item.publishedAt || item.createdAt) : ''"
    >
      <div v-if="isLoading" class="text-sm text-muted-foreground">{{ t('common.loading') }}</div>
      <div v-else-if="item" class="space-y-4">
        <p class="text-muted-foreground">{{ item.summary }}</p>
        <div class="whitespace-pre-wrap text-sm leading-relaxed">
          {{ item.content }}
        </div>
      </div>
    </SectionCard>
  </div>
</template>
