<script setup lang="ts">
import { onMounted } from 'vue'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'
import { useDateStore } from '@/stores/dateStore'
import { storeToRefs } from 'pinia'

const router: Router = useRouter()
const route: RouteLocationNormalizedLoaded = useRoute()

const dateStore = useDateStore()

const { latestDate } = storeToRefs(dateStore)

onMounted(async () => {
  if (route.fullPath === '/') {
    await dateStore.getDateRange('zh')
    router.push({ path: `/zh/${latestDate.value}` })
  }
})
</script>

<template>
  <router-view></router-view>
</template>

<style lang="scss"></style>
