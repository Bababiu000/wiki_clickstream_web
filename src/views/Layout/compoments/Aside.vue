<template>
  <el-aside width="200px">
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
  </el-aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDateRangeAPI } from '@/apis/clickstream.js'

const route = useRoute()
const router = useRouter()

const years = ref([])
const months = ref({})
const maxYear = ref(0)
const maxMonth = ref(0)

const getDateRange = async () => {
  const res = await getDateRangeAPI()
  const dateRange = res.data
  years.value = dateRange.years
  months.value = dateRange.months
  maxYear.value = dateRange.maxYear
  maxMonth.value = dateRange.maxMonth
}

onMounted(async () => {
  await getDateRange()
  if (!route.params.date) router.push(`/${maxYear.value}-${maxMonth.value}`)
})
</script>

<style lang="scss">
.menu {
  display: flex;
  flex-direction: column;
  height: 100%;

  .menu-title {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
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
