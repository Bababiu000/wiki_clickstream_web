<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'
import { useDateStore } from '@/stores/dateStore'
import { TabPaneName } from 'element-plus/es/components/tabs/src/tabs'

const route: RouteLocationNormalizedLoaded = useRoute()
const router: Router = useRouter()

const dateStore = useDateStore()
const { years, months, latestDate } = storeToRefs(dateStore)

const lang: Ref<string> = ref(route.params.lang as string)
const currDate: ComputedRef<string> = computed(() => route.params.date as string)

const langChange = async (lang: TabPaneName): Promise<void> => {
  await dateStore.getDateRange(lang as string)
  router.push({ path: `/${lang}/${latestDate.value}` })
}
</script>

<template>
  <div class="menu">
    <h3 class="menu-title">wiki cls 数据可视化</h3>
    <el-tabs class="menu-tabs" :model-value="lang" @tab-change="langChange" stretch>
      <el-tab-pane label="中文数据" name="zh"></el-tab-pane>
      <el-tab-pane label="英文数据" name="en"></el-tab-pane>
    </el-tabs>
    <el-menu class="el-menu-vertical-demo" :default-active="`${currDate}`" router unique-opened>
      <el-sub-menu v-for="year in years" :index="`/${year}`">
        <template #title>
          <span>{{ year }} 年</span>
        </template>
        <el-menu-item v-for="month in months[year]" :index="`${year}-${month}`">{{ month }} 月</el-menu-item>
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

  .menu-tabs {
    border-right: solid 1px var(--el-menu-border-color);
    .is-top {
      margin-bottom: 0;
    }
    .el-tabs__nav-wrap::after {
      height: 1px;
    }
    .el-tabs__item {
      margin: 2px 0;
      padding: 0;
    }
  }

  .lang {
    position: relative;
    height: 40px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    border-right: solid 1px var(--el-menu-border-color);
    border-bottom: solid 1px var(--el-menu-border-color);
    .lang-item {
      &:first-child::after {
        content: '';
        position: absolute;
        display: block;
        top: 25%;
        left: 50%;
        width: 1px;
        height: 50%;
        background-color: var(--el-menu-border-color);
      }
    }
    .lang-item-active {
      color: var(--el-color-primary);
    }
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
