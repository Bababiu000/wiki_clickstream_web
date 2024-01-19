<script setup lang="ts">
import Aside from './compoments/Aside.vue'
import Main from './compoments/Main.vue'
</script>

<template>
  <div class="layout">
    <el-container>
      <el-aside width="200px">
        <Aside></Aside>
      </el-aside>
      <el-main>
        <Main></Main>
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
