<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getErrorMessage, showRequestFailed } from '@/common'
import SectionCard from '@/components/shared/SectionCard.vue'
import { fetchNews, type NewsItem } from '@/services/phase5.service'

const router = useRouter()
const isLoading = ref(false)
const items = ref<NewsItem[]>([])

function formatDate(value?: string) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('vi-VN')
}

async function load() {
  isLoading.value = true
  try {
    const data = await fetchNews({ page: 1, limit: 50 })
    items.value = data.items ?? []
  } catch (error) {
    showRequestFailed(getErrorMessage(error) || 'Không tải được tin tức')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <div class="space-y-4">
    <SectionCard title="News" description="Tin tức vận hành từ Admin">
      <div v-if="isLoading" class="text-sm text-muted-foreground">Đang tải...</div>
      <div
        v-else-if="!items.length"
        class="rounded-xl border border-dashed p-8 text-center text-muted-foreground"
      >
        Chưa có tin đã publish
      </div>
      <div v-else class="space-y-3">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="w-full rounded-xl border p-4 text-left transition hover:bg-muted/40"
          @click="router.push({ name: 'news-detail', params: { slug: item.slug } })"
        >
          <p class="font-medium">{{ item.title }}</p>
          <p class="mt-1 text-sm text-muted-foreground">{{ item.summary }}</p>
          <p class="mt-2 text-xs text-muted-foreground">
            {{ formatDate(item.publishedAt || item.createdAt) }}
          </p>
        </button>
      </div>
    </SectionCard>
  </div>
</template>
