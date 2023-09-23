<script setup>
import Aside from './compoments/Aside.vue'
</script>

<template>
  <div class="layout">
    <el-container>
      <el-header>
        <h2>wiki clickstream 数据可视化</h2>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <Aside></Aside>
        </el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="less" scoped>
.layout {
  width: 100%;
  min-height: 100vh;

  .el-container {
    &.is-vertical {
      height: 100vh;
    }
  }

  .el-header {
    width: 100%;
    text-align: center;
    line-height: 60px;
    border-bottom: 2px solid #f0f0f0;
  }

  .el-aside {
    height: 100%;
  }
}
</style>
