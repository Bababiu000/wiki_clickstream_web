<script setup>
import Aside from './compoments/Aside.vue'
</script>

<template>
  <div class="layout">
    <el-container>
      <Aside></Aside>
      <el-container>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  width: 100%;
  min-height: 100vh;

  .el-container {
    &.is-vertical {
      min-height: 100vh;
    }
  }

  .el-header {
    width: 100%;
    text-align: center;
    line-height: 60px;
    border-bottom: 2px solid #f0f0f0;
  }

  .el-aside {
    min-height: 100vh;
  }

  .el-main {
    padding: 0;
  }
}
</style>
