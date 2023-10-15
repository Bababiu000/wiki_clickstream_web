<script setup>
import Aside from './compoments/Aside.vue'
</script>

<template>
  <div class="layout">
    <el-container>
      <el-aside width="200px">
        <Aside></Aside>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<style lang="scss">
.layout {
  > .el-container {
    position: fixed;
    width: 100%;
    height: 100%;
  }

  .el-aside {
    height: 100%;
  }

  .el-main {
    padding: 0;
  }
}
</style>
