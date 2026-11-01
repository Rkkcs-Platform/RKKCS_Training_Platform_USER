<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from '@/components/ui/sonner'
import logoUrl from '@/assets/logo.png'

// Keep brand logo warm so loading overlays appear instantly
const warmLogo = new Image()
warmLogo.src = logoUrl
</script>

<template>
  <RouterView />
  <img
    :src="logoUrl"
    alt=""
    width="1"
    height="1"
    decoding="async"
    class="pointer-events-none fixed -left-[9999px] size-px opacity-0"
    aria-hidden="true"
  />
  <Toaster
    position="top-center"
    rich-colors
    close-button
    expand
    :duration="3000"
    :visible-toasts="4"
  />
</template>
