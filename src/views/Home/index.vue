<script setup>
import { onMounted } from 'vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

const data = [
  {
    name: '乖巧',
    value: 100
  },
  {
    name: '可爱',
    value: 90
  },
  {
    name: '纯洁',
    value: 80
  },
  {
    name: '机灵',
    value: 70
  },
  {
    name: '活泼',
    value: 55
  }
]

onMounted(() => {
  const mychart = echarts.init(document.getElementById('container'))
  mychart.setOption({
    series: [
      {
        type: 'wordCloud',
        // shape这个属性虽然可配置，但是在词的数量不太多的时候，效果不明显，它会趋向于画一个椭圆
        shape: 'circle',
        // 这个功能没用过
        keepAspect: false,
        // maskImage这个是可以自定义背景图片的，词云会按照图片的形状排布，所以有形状限制的时候，最好用背景图来实现，而且，这个背景图一定要放base64的，不然词云画不出来
        // maskImage: '',
        // 下面就是位置的配置
        left: 'center',
        top: 'center',
        width: '70%',
        height: '80%',
        right: null,
        bottom: null,
        // 词的大小，最小12px，最大60px，可以在这个范围调整词的大小
        sizeRange: [12, 60],
        // 每个词旋转的角度范围
        rotationRange: [-90, 90],
        rotationStep: 45,
        // 词间距，数值越小，间距越小，这里间距太小的话，会出现大词把小词套住的情况，比如一个大的口字，中间会有比较大的空隙，这时候他会把一些很小的字放在口字里面，这样的话，鼠标就无法选中里面的那个小字
        gridSize: 8,
        // 允许词太大的时候，超出画布的范围
        drawOutOfBound: false,
        // 布局的时候是否有动画
        layoutAnimation: true,
        // 这是全局的文字样式，相对应的还可以对每个词设置字体样式
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          // 颜色可以用一个函数来返回字符串
          color: function () {
            // Random color
            return (
              'rgb(' +
              [Math.round(Math.random() * 160), Math.round(Math.random() * 160), Math.round(Math.random() * 160)].join(
                ','
              ) +
              ')'
            )
          }
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            textShadowBlur: 10,
            textShadowColor: '#333'
          }
        },
        // 数据必须是一个数组，数组是对象，对象必须有name和value属性
        data
      }
    ]
  })
  mychart.on('click', function (params) {
    console.log(params)
  })
})
</script>

<template>
  <div class="home">
    <div id="container"></div>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  #container {
    width: 100%;
    height: 100%;
  }
}
</style>
