<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  useRoute,
  useRouter,
  onBeforeRouteUpdate,
  RouteLocationNormalizedLoaded,
  Router
} from 'vue-router'
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import { exportImg } from '@/utils/dataExport'
import { getCenterNodesAPI, getClusterNodesAPI } from '@/apis/clickstream_node'

interface GraphNode {
  name: string
  dcDictIdx: number
  density: number
  value: number
}

const router: Router = useRouter()
const route: RouteLocationNormalizedLoaded = useRoute()
const myChart: Ref<echarts.EChartsType | null> = ref(null)
const clsDataList: Ref<GraphNode[]> = ref([])

const lang: Ref<string> = ref(route.params.lang as string)
const currDate: Ref<string> = ref(route.params.date as string)

const currCenter: ComputedRef<number | undefined> = computed(() => {
  const queryCenter = route.query.center

  if (queryCenter === null || queryCenter === undefined) return undefined
  else return +queryCenter
})

onMounted(async () => {
  myChart.value = echarts.init(document.getElementById('container'))
  if (currCenter.value) await getClusterNodes(lang.value, currDate.value, currCenter.value)
  else {
    myChart.value.on('click', params => {
      const { data: cls } = params
      router.push({
        name: 'WordCloud',
        query: { center: (cls as GraphNode).dcDictIdx }
      })
    })
    await getCenterNodes(lang.value, currDate.value)
  }
  renderWordCloud()
})

onBeforeRouteUpdate(async (to, from) => {
  if (to.query.center) await getClusterNodes(lang.value, currDate.value, +to.query.center)
  else {
    myChart.value!.on('click', params => {
      const { data: cls } = params
      router.push({
        name: 'WordCloud',
        query: { center: (cls as GraphNode).dcDictIdx }
      })
    })
    await getCenterNodes(lang.value, currDate.value)
  }
  renderWordCloud()
})

const getCenterNodes = async (lang: string, dateStr: string) => {
  const res = await getCenterNodesAPI(lang, dateStr)
  clsDataList.value = res.data
  clsDataList.value.forEach(i => {
    i.value = i.density
  })
}

const getClusterNodes = async (lang: string, dateStr: string, center: number) => {
  const res = await getClusterNodesAPI(lang, dateStr, center)
  clsDataList.value = res.data
  clsDataList.value.forEach(i => {
    i.value = i.density
  })
}

const renderWordCloud = () => {
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
        sizeRange: [14, 70],
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
        data: clsDataList.value
      }
    ]
  }
  myChart.value!.setOption(option)
}

const goBack = () => {
  router.back()
}

const onClickExportImg = () => {
  let fileName = `${currDate.value} ${currCenter.value ? clsDataList.value[0].name : ''} 词云图`
  exportImg(fileName, 'container')
}
</script>

<template>
  <div class="word-cloud">
    <div class="btn-box">
      <el-button @click="goBack" v-blur-fix class="back">返回</el-button>
      <el-button type="primary" v-blur-fix @click="onClickExportImg">保存图片</el-button>
    </div>
    <div id="container"></div>
  </div>
</template>

<style lang="scss" scoped>
.word-cloud {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  #container {
    width: 100%;
    height: 100%;
  }
  .btn-box {
    position: fixed;
    z-index: 999;
    top: 50px;
    right: 5%;
  }
}
</style>
