<script setup>
import * as echarts from 'echarts'
import { getCenterNodesAPI, getClusterNodesAPI } from '@/apis/clickstream_node.js'
import { getCenterEdgesAPI, getClusterEdgesAPI } from '@/apis/clickstream_edge.js'
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'
import { exportImg } from '@/utils/dataExport.js'

const router = useRouter()
const route = useRoute()
const myChart = ref(null)
const clsNodes = ref([])
const clsEdges = ref([])

onMounted(async () => {
  myChart.value = echarts.init(document.getElementById('container'))
  if (route.query.center) {
    getClusterNodes(route.params.date, route.query.center)
    await getClusterEdges(route.params.date, route.query.center)
  } else {
    myChart.value.on('click', params => {
      const { data: cls } = params
      router.push({ path: `/graph/${route.params.date}`, query: { center: cls.dcDictIdx } })
    })
    await getCenterNodes(route.params.date)
    await getCenterEdges(route.params.date)
  }
  initOption()
  renderGraph()
})

const getCenterNodes = async dateStr => {
  const res = await getCenterNodesAPI(dateStr)
  clsNodes.value = res.data
}

const getCenterEdges = async dateStr => {
  const res = await getCenterEdgesAPI(dateStr)
  clsEdges.value = res.data
}

const getClusterNodes = async (dateStr, center) => {
  const res = await getClusterNodesAPI(dateStr, center)
  clsNodes.value = res.data
}

const getClusterEdges = async (dateStr, center) => {
  const res = await getClusterEdgesAPI(dateStr, center)
  clsEdges.value = res.data
}

let option = {
  series: [
    {
      type: 'graph', // 图的类型为关系图
      layout: 'force', // 使用力导向布局
      force: {
        repulsion: 100, // 节点间的斥力
        gravity: 0.1 // 中心点的引力
      },
      label: {
        show: true,
        position: 'top', // 调整节点名称的位置
        color: 'black' // 设置节点名称的颜色
      },
      itemStyle: {
        color: params => {
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
      // 其他图表配置项
      dataZoom: [
        {
          type: 'inside', // 内置的缩放工具
          start: 0,
          end: 100
        },
        {
          start: 0,
          end: 100,
          showDetail: false // 不显示详细信息
          // 更多配置项
        }
      ],
      roam: true, // 启用拖动
      lineStyle: {
        curveness: 0,
        opacity: 0.6
      }
    }
  ]
}

let directedEdgesStorage = []
const initOption = () => {
  let centerNode = clsNodes.value[0]
  let maxDensity = centerNode.density
  let data = clsNodes.value.map(i => {
    return {
      id: i.dictIdx + '',
      name: i.name,
      symbolSize: (i.density / maxDensity) * 100,
      dcDictIdx: i.dcDictIdx
    }
  })

  let links = clsEdges.value.map(i => {
    return {
      source: i.sourceDictIdx + '',
      target: i.targetDictIdx + '',
      value: i.weight
    }
  })

  directedEdgesStorage = links
  Promise.resolve().then(() => convertToUndirectedEdges(links))

  option.series[0].data = data
  option.series[0].links = links
  option.series[0].edgeLabel.show = false
  option.series[0].lineStyle.curveness = 0
  option.series[0].edgeSymbol[1] = 'none'
  isShowDirectedEdge.value = false
  isShowEdgeLabel.value = false

  myChart.value.dispatchAction({
    type: 'restore'
  })
}

const renderGraph = async () => {
  myChart.value.setOption(option)
}

const goBack = e => {
  router.back()
}

const onClickExportImg = () => {
  let fileName = `${route.params.date} ${route.query.center ? clsNodes.value[0].name : ''} 关系图`
  exportImg(fileName, 'container')
}

onBeforeRouteUpdate(async (to, from) => {
  if (to.query.center) {
    getClusterNodes(to.params.date, to.query.center)
    await getClusterEdges(to.params.date, to.query.center)
  } else {
    myChart.value.on('click', params => {
      const { data: cls } = params
      router.push({ path: `/graph/${route.params.date}`, query: { center: cls.dcDictIdx } })
    })
    getCenterNodes(route.params.date)
    await getCenterEdges(route.params.date)
  }
  initOption()
  renderGraph()
})

let undirectedEdgesStorage = []
const isShowDirectedEdge = ref(false)
const showDirectedEdgeChange = flag => {
  if (flag) {
    option.series[0].links = directedEdgesStorage
  } else {
    if (undirectedEdgesStorage.length) option.series[0].links = undirectedEdgesStorage
    else option.series[0].links = convertToUndirectedEdges(option.series[0].links)
  }
  option.series[0].lineStyle.curveness = flag ? 0.3 : 0
  option.series[0].edgeSymbol[1] = flag ? 'arrow' : 'none'
  renderGraph()
}

const isShowEdgeLabel = ref(false)
const showEdgeLabelChange = flag => {
  option.series[0].edgeLabel.show = flag
  renderGraph()
}
const convertToUndirectedEdges = directedEdges => {
  let undirectedEdges = {}
  for (let i = 0; i < directedEdges.length; i++) {
    let edge = directedEdges[i]
    let key = edge.source + '-' + edge.target
    let reverseKey = edge.target + '-' + edge.source

    if (undirectedEdges[reverseKey]) {
      // 如果无向边已存在，将权重相加
      undirectedEdges[reverseKey].value += edge.value
    } else {
      // 否则，创建新的无向边
      undirectedEdges[key] = {
        source: edge.source,
        target: edge.target,
        value: edge.value
      }
    }
  }

  undirectedEdgesStorage = Object.values(undirectedEdges)

  return Object.values(undirectedEdges)
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
      <el-switch
        class="switch"
        v-model="isShowEdgeLabel"
        active-text="显示跳转次数"
        @change="showEdgeLabelChange"
      />
    </div>
    <div class="btn-box">
      <el-button @click="goBack" class="back" v-blur-fix>返回</el-button>
      <el-button type="primary" @click="onClickExportImg" v-blur-fix>保存图片</el-button>
    </div>
    <div id="container"></div>
  </div>
</template>
<style lang="scss" scoped>
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
    top: 50px;
  }

  .switch-box {
    left: 3%;
    display: flex;
    flex-direction: column;
  }

  .btn-box {
    right: 5%;
  }
}
</style>
