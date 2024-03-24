<script setup lang="ts">
import * as echarts from 'echarts'
import { getCenterNodesAPI, getClusterNodesAPI } from '@/apis/clickstream_node'
import { getCenterEdgesAPI, getClusterEdgesAPI } from '@/apis/clickstream_edge'
import { Router, RouteLocationNormalizedLoaded, useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'
import { exportImg } from '@/utils/dataExport'

const router: Router = useRouter()
const route: RouteLocationNormalizedLoaded = useRoute()
let myChart: echarts.EChartsType

interface ClsEdge {
  id: number
  sourceDictIdx: number
  targetDictIdx: number
  distance: number
  weight: number
  value: number
  date: Date
  lang: string
}
interface ClsNode {
  id: number
  dictIdx: number
  name: string
  density: number
  dcDictIdx: number
  x?: number
  y?: number
  date: Date
  label: number
  lang: string
}
interface GraphNode {
  id: string
  name: string
  label: number
  symbolSize: number
  x?: number
  y?: number
  value?: number[]
}
interface GraphEdge {
  source: string
  target: string
  value: number
}
const clsNodes: Ref<ClsNode[]> = ref([])
const clsEdges: Ref<ClsEdge[]> = ref([])
let nodes: GraphNode[] = []

const lang: Ref<string> = ref(route.params.lang as string)
const currDate: Ref<string> = ref(route.params.date as string)

const currLabel: ComputedRef<number | undefined> = computed(() => {
  const queryLabel = route.query.label

  if (queryLabel === null || queryLabel === undefined) return undefined
  else return +queryLabel
})

onMounted(async () => {
  myChart = echarts.init(document.getElementById('container'))
  if (currLabel.value) {
    getClusterNodes(lang.value, currDate.value, currLabel.value!)
    await getClusterEdges(lang.value, currDate.value, currLabel.value!)
  } else {
    myChart.on('click', (params: any) => {
      const { data: cls } = params
      router.push({ name: 'Graph', query: { label: cls.label } })
    })
    await getCenterNodes(lang.value, currDate.value)
    await getCenterEdges(lang.value, currDate.value)
  }
  initOption()
  renderGraph()
})

const getCenterNodes = async (lang: string, dateStr: string): Promise<void> => {
  const res = await getCenterNodesAPI(lang, dateStr)
  clsNodes.value = res.data
}

const getCenterEdges = async (lang: string, dateStr: string): Promise<void> => {
  const res = await getCenterEdgesAPI(lang, dateStr)
  clsEdges.value = res.data
}

const getClusterNodes = async (lang: string, dateStr: string, label: number): Promise<void> => {
  const res = await getClusterNodesAPI(lang, dateStr, label)
  clsNodes.value = res.data
}

const getClusterEdges = async (lang: string, dateStr: string, label: number): Promise<void> => {
  const res = await getClusterEdgesAPI(lang, dateStr, label)
  clsEdges.value = res.data
}

let option: echarts.EChartsOption = {
  xAxis: {
    type: 'value'
  },
  yAxis: {
    type: 'value'
  },
  grid: {
    left: 50,
    right: 50,
    top: 50,
    bottom: 50
  },
  series: [
    {
      type: 'graph', // 图的类型为关系图
      layout: 'force',
      force: {
        repulsion: 100, // 节点间的斥力
        gravity: 0.1 // 中心点的引力
      },
      coordinateSystem: 'cartesian2d',
      label: {
        show: true,
        position: 'top', // 调整节点名称的位置
        color: 'black' // 设置节点名称的颜色
      },
      // 高亮样式
      emphasis: {
        label: {
          color: '#000', // 高亮节点文字颜色
          backgroundColor: 'yellow', // 高亮节点背景样式
          padding: 5, // 背景内边距
          borderRadius: 5 // 背景圆角
        }
      },
      itemStyle: {
        color: (params: any) => {
          let nodeName = params.data.name
          let hash = 0
          for (let i = 0; i < nodeName.length; i++) {
            hash = nodeName.charCodeAt(i) + ((hash << 5) - hash)
          }
          const red = (hash % 90) + 125 // 调整红色通道，使颜色柔和
          const green = ((hash * 2) % 100) + 125 // 调整绿色通道，使颜色柔和
          const blue = ((hash * 3) % 100) + 125 // 调整蓝色通道，使颜色柔和

          const color = `rgb(${red}, ${green}, ${blue})`
          return color
        }
      },
      // 设置边的样式
      edgeSymbol: ['none', 'none'], // 可以使用箭头来表示边
      edgeSymbolSize: [0, 10], // 设置箭头的大小
      edgeLabel: {
        show: false,
        position: 'middle',
        formatter: '{c}'
      },
      roam: true, // 启用鼠标缩放和拖动
      lineStyle: {
        curveness: 0,
        opacity: 0.6
      }
    }
  ],
  // 缩放工具
  dataZoom: [
    {
      type: 'slider',
      start: 0,
      end: 100
    },
    {
      type: 'slider',
      orient: 'vertical',
      start: 0,
      end: 100
    }
  ]
}

let directedEdgesStorage: GraphEdge[] = []
const initOption = () => {
  let centerNode = clsNodes.value[0]
  let maxDensity = centerNode.density
  nodes = clsNodes.value.map(i => {
    return {
      id: i.dictIdx + '',
      name: i.name,
      value: [i.x as number, i.y as number],
      symbolSize: (i.density / maxDensity) * 100,
      label: i.label
    }
  })

  let links: GraphEdge[] = clsEdges.value.map(i => {
    return {
      source: i.sourceDictIdx + '',
      target: i.targetDictIdx + '',
      value: i.weight
    }
  })

  directedEdgesStorage = links
  convertToUndirectedEdges(links)

  const series = option.series as echarts.GraphSeriesOption[]
  series[0].data = nodes
  series[0].links = links
  series[0].edgeLabel!.show = false
  series[0].lineStyle!.curveness = 0
  ;(series[0].edgeSymbol as string[])[1] = 'none'
  isShowDirectedEdge.value = false
  isShowEdgeLabel.value = false

  myChart.dispatchAction({
    type: 'restore'
  })
}

const renderGraph = async () => {
  myChart.setOption(option)
}

const goBack = () => {
  router.back()
}

const onClickExportImg = () => {
  let fileName = `${lang.value}-${currDate.value}-${currLabel.value ? clsNodes.value[0].name : ''}-关系图`
  exportImg(fileName, 'container')
}

onBeforeRouteUpdate(async (to, from) => {
  if (to.query.label) {
    getClusterNodes(lang.value, currDate.value, +to.query.label)
    await getClusterEdges(lang.value, currDate.value, +to.query.label)
  } else {
    myChart.on('click', params => {
      const { data: cls } = params
      router.push({
        name: 'Graph',
        query: { label: (cls as GraphNode).label }
      })
    })
    getCenterNodes(lang.value, currDate.value)
    await getCenterEdges(lang.value, currDate.value)
  }
  initOption()
  renderGraph()
})

let undirectedEdgesStorage: GraphEdge[] = []
// 是否显示有向边
const isShowDirectedEdge = ref(false)
const showDirectedEdgeChange: (flag: string | number | boolean) => any = flag => {
  const series = option.series as echarts.GraphSeriesOption[]
  if (flag) {
    series[0].links = directedEdgesStorage
  } else {
    if (undirectedEdgesStorage.length) series[0].links = undirectedEdgesStorage
    else series[0].links = convertToUndirectedEdges(series[0].links as GraphEdge[])
  }
  series[0].lineStyle!.curveness = flag ? 0.3 : 0
  ;(series[0].edgeSymbol as string[])[1] = flag ? 'arrow' : 'none'
  renderGraph()
}
// 有向边转换为无向边
const convertToUndirectedEdges = (directedEdges: GraphEdge[]) => {
  let undirectedEdgesObj: { [key: string]: GraphEdge } = {}
  for (let i = 0; i < directedEdges.length; i++) {
    let edge = directedEdges[i]
    let key = edge.source + '-' + edge.target
    let reverseKey = edge.target + '-' + edge.source

    if (undirectedEdgesObj[reverseKey]) {
      // 如果无向边已存在，将权重相加
      undirectedEdgesObj[reverseKey].value += edge.value
    } else {
      // 否则，创建新的无向边
      undirectedEdgesObj[key] = {
        source: edge.source,
        target: edge.target,
        value: edge.value
      }
    }
  }

  undirectedEdgesStorage = Object.values(undirectedEdgesObj)

  return Object.values(undirectedEdgesObj)
}

// 是否显示跳转次数
const isShowEdgeLabel = ref(false)
const showEdgeLabelChange: (flag: string | number | boolean) => any = flag => {
  const series = option.series as echarts.GraphSeriesOption[]
  series[0].edgeLabel!.show = flag as boolean
  renderGraph()
}

// 是否启用力引导布局
let isUseForce = ref(false)
const useForceChange: (flag: string | number | boolean) => any = flag => {
  const series = option.series as echarts.GraphSeriesOption[]
  if (flag) {
    series[0].layout = 'force'
    series[0].coordinateSystem = undefined
    option.dataZoom = []
  } else {
    series[0].layout = 'none'
    series[0].coordinateSystem = 'cartesian2d'
    option.dataZoom = [
      {
        type: 'slider',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        orient: 'vertical',
        start: 0,
        end: 100
      }
    ]
  }
  option.xAxis!.show = !flag
  option.yAxis!.show = !flag
  myChart.clear() // 清除当前图表的状态
  renderGraph()
}

let keyword: Ref<string> = ref('') // 关键字
// 高亮关键字
const highlightNode = () => {
  // 清空高亮
  myChart.dispatchAction({
    type: 'downplay',
    seriesIndex: 0
  })
  keyword.value = keyword.value.trim()
  if (keyword.value === '') return
  let keywordArray = keyword.value.split(',').map(keyword => keyword.trim())
  keywordArray.forEach(keyword => {
    let matchingNodes = nodes.filter(node => node.name.includes(keyword))
    if (matchingNodes.length > 0) {
      matchingNodes.forEach(node => {
        myChart.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: nodes.findIndex(n => n === node)
        })
      })
    }
  })
}
</script>
<template>
  <div class="graph">
    <div class="switch-box">
      <el-switch
        class="switch"
        v-model="isShowDirectedEdge"
        active-text="显示有向边"
        @change="showDirectedEdgeChange"
      />
      <el-switch class="switch" v-model="isShowEdgeLabel" active-text="显示跳转次数" @change="showEdgeLabelChange" />
      <el-switch class="switch" v-model="isUseForce" active-text="启用力引导布局" @change="useForceChange" />
    </div>
    <div class="btn-box">
      <div class="top-btn">
        <el-button @click="goBack" class="back" v-blur-fix>返回</el-button>
        <el-button type="primary" @click="onClickExportImg" v-blur-fix>保存图片</el-button>
      </div>
      <!-- 搜索框 -->
      <div class="search">
        <el-input
          @keyup.enter="highlightNode"
          class="search-input"
          clearable
          placeholder="搜索关键字"
          v-model="keyword"
        >
          <template #prefix>
            <i-ep-search></i-ep-search>
          </template>
        </el-input>
        <el-button class="search-btn" type="primary" @click="highlightNode" v-blur-fix>
          <i-ep-search style="padding-left: 4px"></i-ep-search>
        </el-button>
      </div>
    </div>
    <div id="container"></div>
  </div>
</template>
<style lang="scss">
.graph {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  #container {
    width: 100%;
    height: 100%;
  }

  .switch-box,
  .btn-box {
    position: fixed;
    z-index: 999;
    top: 19px;
  }

  .switch-box {
    left: 3%;
    display: flex;
    flex-direction: column;
    .switch {
      .el-switch__label {
        span {
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }
  }

  .btn-box {
    display: flex;
    flex-direction: column;
    right: 2%;
    .top-btn {
      display: flex;
      justify-content: end;
    }
    .search {
      margin-top: 12px;
      text-wrap: nowrap;
      .search-input {
        width: 130px;
        .el-input__wrapper {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
      }
      .search-btn {
        margin-left: -5px;
      }
    }
  }
}
</style>
