<template>
  <div class="menu">
    <el-menu class="el-menu-vertical-demo" :default-active="`/${maxYear}-${maxMonth}`" router unique-opened>
      <el-sub-menu v-for="year in dateRange.years" :index="`/${year}`">
        <template #title>
          <span>{{ year }} 年</span>
        </template>
        <el-menu-item v-for="month in dateRange.months[year]" :index="`/${year}-${month}`">{{ month }} 月</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDataAPI } from '@/apis/clickstream'

const router = useRouter()

const dateRange = {
  years: ['2023', '2022', '2021', '2020'],
  months: {
    2020: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    2021: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    2022: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    2023: [1, 2, 3, 4, 5, 6, 7, 8]
  },
  maxYear: 2023,
  maxMonth: 8
}
const { years, months, maxYear, maxMonth } = dateRange
onMounted(async () => {
  router.push(`/${maxYear}-${maxMonth}`)
  const res = await getDataAPI('2023-08-01')
  console.log(res)
})
</script>

<style>
.menu {
  height: 100%;
  .el-menu {
    height: 100%;
    .el-menu-item {
      height: 40px;
      line-height: 40px;
    }
  }
}
</style>
@/apis/clickstream
