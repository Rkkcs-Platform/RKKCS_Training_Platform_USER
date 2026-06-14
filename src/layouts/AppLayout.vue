<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppBottomNav from '@/components/layout/AppBottomNav.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
const mobileSidebarOpen = ref(false)
</script>

<template>
  <div class="min-h-svh bg-muted/30">
    <div
      v-if="mobileSidebarOpen"
      class="fixed inset-0 z-40 bg-black/40 lg:hidden"
      @click="mobileSidebarOpen = false"
    />

    <div class="flex min-h-svh">
      <AppSidebar
        :open="mobileSidebarOpen"
        @close="mobileSidebarOpen = false"
      />

      <div class="flex min-h-svh min-w-0 flex-1 flex-col">
        <AppHeader show-menu-button @open-sidebar="mobileSidebarOpen = true" />

        <main class="flex-1">
          <PageContainer>
            <RouterView />
          </PageContainer>
        </main>

        <AppBottomNav />
      </div>
    </div>
  </div>
</template>
