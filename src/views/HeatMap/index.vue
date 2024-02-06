<script setup lang="ts">
import * as echarts from 'echarts/core'
import {
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  VisualMapComponent,
  VisualMapComponentOption
} from 'echarts/components'
import { HeatmapChart, HeatmapSeriesOption } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { getClusterNodesAPI, getMonthlySimilarityAPI } from '@/apis/clickstream_node'
import { storeToRefs } from 'pinia'
import { useDateStore } from '@/stores/dateStore'
import {
  Router,
  useRouter,
  RouteLocationNormalizedLoaded,
  useRoute,
  onBeforeRouteUpdate,
  RouteLocationNormalized
} from 'vue-router'

echarts.use([TooltipComponent, GridComponent, VisualMapComponent, HeatmapChart, CanvasRenderer])

type EChartsOption = echarts.ComposeOption<
  TooltipComponentOption | GridComponentOption | VisualMapComponentOption | HeatmapSeriesOption
>

let myChart: echarts.EChartsType
let option: EChartsOption

let vennChart: echarts.EChartsType
let vennOption

const router: Router = useRouter()
const route: RouteLocationNormalizedLoaded = useRoute()

let xLen: number = 0
let yLen: number = 0
const similarityList: Ref<number[][]> = ref([])
const getMonthlySimilarity = async (lang: string, dateStr1: string, dateStr2: string): Promise<void> => {
  const res = await getMonthlySimilarityAPI(lang, dateStr1, dateStr2)
  similarityList.value = res.data.similarityList
  xLen = res.data.colSize
  yLen = res.data.rowSize
}

let xData: number[] = []
let yData: number[] = []
let data: number[][] = []
const loadData = (): number[][] => {
  xData = []
  yData = []
  data = []
  for (let i = 0; i < xLen; i++) {
    for (let j = 0; j < yLen; j++) {
      data.push([i, j, similarityList.value[i][j]])
    }
    xData.push(i)
  }
  for (let j = 0; j < yLen; j++) {
    yData.push(j)
  }
  return data
}

const renderHeatMap = (): void => {
  let data = loadData()
  option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        // 判断是否为热力图上的点
        if (params.seriesType === 'heatmap') {
          let [x, y, value] = params.value
          x = x + 1
          y = y + 1
          return `坐标: (${x}, ${y}), 相似度: ${(value * 100).toFixed(2)}%
            <br/>${xDate.value}主题${x} 对比 ${yDate.value}主题${y}
            <br/>点击查看详情`
        }
        return ''
      }
    },
    grid: {
      right: 140,
      left: 40
    },
    xAxis: {
      type: 'category',
      data: xData,
      name: xDate.value
    },
    yAxis: {
      type: 'category',
      data: yData,
      name: yDate.value
    },
    visualMap: {
      // 设置视觉映射的类型为分段型（piecewise）
      type: 'piecewise',
      // 指定映射的数值范围，这里设置为 0 到 1
      min: 0,
      max: 1,
      // 视觉映射组件的位置，这里设置在图表的右侧（'right'）和中央（'center'）
      left: 'right',
      top: 'center',
      // 是否支持拖拽漫游和缩放，默认为可拖拽（calculable）
      calculable: true,
      // 是否实时更新。如果设置为 true，视觉映射的显示范围会随着图表的变化而实时更新
      realtime: false,
      // 划分数值范围的数量
      splitNumber: 10,
      // 配置每个数值范围的颜色
      inRange: {
        color: [
          '#313695',
          '#4575b4',
          '#74add1',
          '#abd9e9',
          '#e0f3f8',
          '#ffcc00',
          '#fee090',
          '#fdae61',
          '#f46d43',
          '#d73027',
          '#a50026'
        ]
      }
    },
    // 定义一个包含单个热力图系列的 series 数组
    series: [
      {
        // 将系列命名为 'Gaussian'
        name: 'Gaussian',
        type: 'heatmap',
        data: data,
        // 通过自定义的 itemStyle 强调系列项
        emphasis: {
          itemStyle: {
            // 将强调项的边框颜色设置为 '#333'
            borderColor: '#333',
            // 将强调项的边框宽度设置为 1
            borderWidth: 1
          }
        },
        // 启用渐进式渲染，延迟为 1000 毫秒
        progressive: 1000,
        // 禁用系列的动画效果
        animation: false
      }
    ]
  }
  myChart.setOption(option)
}

const lang: Ref<string> = ref(route.params.lang as string)
const xDate: Ref<string> = ref(route.query.xDate as string)
const yDate: Ref<string> = ref(route.query.yDate as string)
const dateStore = useDateStore()
const { months } = storeToRefs(dateStore)

const disabledDateFn = (time: Date): boolean => {
  let currYear = time.getFullYear()
  let currMonth = time.getMonth() + 1
  if (months.value.hasOwnProperty(currYear) && months.value[currYear].includes(currMonth)) return false
  return true
}

const dateChange = async () => {
  router.push({ name: 'HeatMap', query: { xDate: xDate.value, yDate: yDate.value } })
}

interface ClsItem {
  id: number
  name: string
  dictIdx: string
  dcDictIdx: string
  density: number
  value: number
  expand: boolean
  members: ClsItem[]
  membersName: string
}
const setA: Ref<string[]> = ref([])
const setB: Ref<string[]> = ref([])
const dialogTableVisible: Ref<boolean> = ref(false)
const getClusterNodes = async (lang: string, dateStr: string, center: number) => {
  const res = await getClusterNodesAPI(lang, dateStr, center)
}

const renderVenn = () => {
  vennChart = echarts.init(document.getElementById('vennChart'))
  vennOption = {
    series: [
      {
        type: 'venn',
        data: [
          { name: 'A', value: 100 },
          { name: 'B', value: 100 },
          { name: 'A&B', value: 30 }
        ],
        itemStyle: {
          emphasis: {
            label: {
              show: true,
              formatter: '{b}: {c}'
            }
          }
        }
      }
    ]
  }

  vennChart.setOption(option)
}

onMounted(async () => {
  myChart = echarts.init(document.getElementById('container'))
  myChart.on('click', (params: any) => {
    if (params.seriesType === 'heatmap') {
      dialogTableVisible.value = true
      let [x, y, value] = params.value
      // alert(`坐标: (${x}, ${y}), 相似度: ${(value * 100).toFixed(2)}%
      //       <br/>${xDate.value}主题${x} 对比 ${yDate.value}主题${y}`)
    }
  })
  await getMonthlySimilarity(lang.value, xDate.value, yDate.value)
  renderHeatMap()
})

onBeforeRouteUpdate(async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  if (to.name === from.name && (to.query.xDate !== from.params.xDate || to.query.yDate !== from.query.yDate)) {
    xDate.value = to.query.xDate as string
    yDate.value = to.query.yDate as string
    await getMonthlySimilarity(lang.value, xDate.value, yDate.value)
    renderHeatMap()
  }
})
</script>
<template>
  <div class="heat-map">
    <div class="date-box">
      <div class="date x-date">
        <span class="demonstration">x轴日期：</span>
        <el-date-picker
          type="month"
          v-model="xDate"
          format="YYYY-MM"
          value-format="YYYY-MM"
          placeholder="选择x轴日期"
          :disabled-date="disabledDateFn"
          @change="dateChange"
        ></el-date-picker>
      </div>
      <div class="date y-date">
        <span class="demonstration">y轴日期：</span>
        <el-date-picker
          type="month"
          v-model="yDate"
          format="YYYY-MM"
          value-format="YYYY-MM"
          placeholder="选择y轴日期"
          :disabled-date="disabledDateFn"
          @change="dateChange"
        />
      </div>
    </div>
    <el-dialog v-model="dialogTableVisible" title="详情" width="800">
      123
      <div id="vennChart" style="width: 600px; height: 400px"></div>
    </el-dialog>
    <div id="container"></div>
  </div>
</template>
<style lang="scss" scoped>
.heat-map {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;

  .date-box {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: center;
    margin-top: 30px;
    .date {
      margin-right: 30px;
    }
  }

  #container {
    flex: 1;
    margin-top: -30px;
    padding: 0 50px;
  }
}
</style>
