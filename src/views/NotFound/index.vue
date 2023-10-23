<template>
  <div class="bg">
    <div class="container">
      <h1>404</h1>
      <h2>Not Found</h2>
      <p>The resource requested could not be found on this server!</p>
      <div class="button">
        <router-link to="/" style="color: #444; text-decoration: none">
          <el-button class="back" type="info" plain size="large">返回首页</el-button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg {
  height: 100vh;
  color: #444;
  font: normal 14px/20px Arial, Helvetica, sans-serif;
  background-color: #fff;
}
.container {
  position: absolute;
  width: 800px;
  margin-left: -400px;
  text-align: center;
  top: 25%;
  left: 50%;
}
h1 {
  margin: 0;
  font-size: 200px;
  line-height: 150px;
  font-weight: bold;
}
h2 {
  margin-top: 20px;
  font-size: 30px;
}
.back {
  margin-top: 20px;
  font-size: 20px;
}
p {
  margin-top: 10px;
  font-size: 16px;
}
</style>
