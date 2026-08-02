<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getErrorMessage, showRequestFailed } from '@/common'
import SectionCard from '@/components/shared/SectionCard.vue'
import { Button } from '@/components/ui/button'
import { fetchNewsBySlug, type NewsItem } from '@/services/phase5.service'

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
    showRequestFailed(getErrorMessage(error) || 'Không tải được bài viết')
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
      ← Quay lại News
    </Button>

    <SectionCard
      :title="item?.title || 'Chi tiết tin'"
      :description="item ? formatDate(item.publishedAt || item.createdAt) : ''"
    >
      <div v-if="isLoading" class="text-sm text-muted-foreground">Đang tải...</div>
      <div v-else-if="item" class="space-y-4">
        <p class="text-muted-foreground">{{ item.summary }}</p>
        <div class="whitespace-pre-wrap text-sm leading-relaxed">
          {{ item.content }}
        </div>
      </div>
    </SectionCard>
  </div>
</template>
