<script setup>
import * as echarts from 'echarts'
import { getDetailAPI } from '@/apis/clickstream.js'
import { useRouter, useRoute } from 'vue-router'
import { exportImg } from '@/utils/dataExport.js'

const router = useRouter()
const route = useRoute()
const myChart = ref(null)
const clsDataList = ref([])

onMounted(async () => {
  myChart.value = echarts.init(document.getElementById('container'))
  await getDetail(route.params.date, route.query.center)
  renderGraph(clsDataList.value)
})

const getDetail = async (dateStr, center) => {
  const res = await getDetailAPI(dateStr, center)
  clsDataList.value = res.data
}

const renderGraph = async data => {
  // 设置symbolSize大小
  let center = clsDataList.value[0]
  let maxDensity = center.density
  data.forEach(i => (i.symbolSize = (i.density / maxDensity) * 100))

  data = data.map(i => {
    return { name: i.name, symbolSize: i.symbolSize }
  })

  let links = data.map(i => {
    return {
      source: center.name,
      target: i.name,
      distance: i.centerDis
    }
  })

  const option = {
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
        links,
        // 设置边的样式
        edgeSymbol: ['none', 'none'], // 可以使用箭头来表示边
        edgeSymbolSize: [0, 10], // 设置箭头的大小
        edgeLine: {
          smooth: 0.2, // 设置边的曲度
          length: 'auto' // 设置边的长度
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
        data
      }
    ]
  }
  myChart.value.setOption(option)
}

const goBack = e => {
  router.back()
  let target = e.target
  if (target.nodeName == 'SPAN' || target.nodeName == 'I') {
    target = e.target.parentNode
  }
  target.blur()
}

const onClickExportImg = () => {
  let fileName = `${route.params.date} ${clsDataList.value[0].name} 关系图`
  exportImg(fileName, 'container')
}
</script>
<template>
  <div class="graph">
    <div class="btn-box">
      <el-button @click="goBack" class="back">返回</el-button>
      <el-button type="primary" @click="onClickExportImg">导出</el-button>
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

  .btn-box {
    position: fixed;
    z-index: 999;
    top: 50px;
    right: 5%;
  }
}
</style>
