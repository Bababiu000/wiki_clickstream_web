<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import { getDCRootAPI, getDCsAPI } from '@/apis/clickstream.js'

const route = useRoute()
const router = useRouter()
const clsDataList = ref([])
const mychart = ref(null)

onMounted(async () => {
  mychart.value = echarts.init(document.getElementById('container'))
  mychart.value.on('click', params => {
    const { data: cls } = params
    router.push({ path: `/${route.params.date}`, query: { dcRoot: cls.dcDictIdx } })
  })
  await getDCRoot(route.params.date)
  renderWordCloud(clsDataList.value)
})

onBeforeRouteUpdate(async (to, from) => {
  console.log(to, from)
  if (from.fullPath === to.fullPath) return
  else if (to.query.dcRoot) await getDCs(to.params.date, to.query.dcRoot)
  else await getDCRoot(to.params.date)
  renderWordCloud(clsDataList.value)
})

const getDCRoot = async dateStr => {
  const res = await getDCRootAPI(dateStr)
  clsDataList.value = res.data
  clsDataList.value.forEach(i => {
    i.value = i.density
  })
}

const getDCs = async (dateStr, dcRoot) => {
  const res = await getDCsAPI(dateStr, dcRoot)
  clsDataList.value = res.data
  clsDataList.value.forEach(i => {
    i.value = i.density
  })
}

const renderWordCloud = data => {
  const option = {
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
        width: '100%',
        height: '100%',
        right: null,
        bottom: null,
        // 词的大小，最小12px，最大60px，可以在这个范围调整词的大小
        sizeRange: [12, 80],
        // 每个词旋转的角度范围
        rotationRange: [-45, 45],
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
              [
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160)
              ].join(',') +
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
  }
  mychart.value.setOption(option)
}
</script>

<template>
  <div class="home">
    <div id="container"></div>
    <div id="secondWordCloud"></div>
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
