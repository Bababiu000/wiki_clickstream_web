<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'
import { getDateRangeAPI } from '@/apis/clickstream_node'

const route: RouteLocationNormalizedLoaded = useRoute()
const router: Router = useRouter()

const years: Ref<number[]> = ref([])
const months: Ref<number[]> = ref([])
const maxYear: Ref<number> = ref(0)
const maxMonth: Ref<number> = ref(0)

const getDateRange = async (): Promise<void> => {
  const res = await getDateRangeAPI()
  const dateRange = res.data
  years.value = dateRange.years
  months.value = dateRange.months
  maxYear.value = dateRange.maxYear
  maxMonth.value = dateRange.maxMonth
}

const currDate: ComputedRef<string | undefined> = computed(() => {
  if (!route.params.date) return undefined
  else route.params.date as string
})

onMounted(async () => {
  await getDateRange()
  if (!currDate.value)
    router.push({
      path: `/${maxYear.value}-${maxMonth.value}`
    })
})
</script>

<template>
  <div class="menu">
    <h3 class="menu-title">wiki cls 数据可视化</h3>
    <el-menu
      class="el-menu-vertical-demo"
      :default-active="`/${route.params.date}`"
      router
      unique-opened
    >
      <el-sub-menu v-for="year in years" :index="`/${year}`">
        <template #title>
          <span>{{ year }} 年</span>
        </template>
        <el-menu-item v-for="month in months[year]" :index="`/${year}-${month}`">
          {{ month }} 月
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<style lang="scss">
.menu {
  display: flex;
  flex-direction: column;
  height: 100%;

  .menu-title {
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-right: solid 1px var(--el-menu-border-color);
    border-bottom: solid 1px var(--el-menu-border-color);
  }

  .el-menu {
    flex: 1;

    .el-menu-item {
      height: 40px;
      line-height: 40px;
    }
  }
}
</style>
