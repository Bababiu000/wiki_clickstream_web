<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  useRoute,
  useRouter,
  onBeforeRouteUpdate,
  RouteLocationNormalizedLoaded,
  Router,
  RouteLocationNormalized
} from 'vue-router'
import 'echarts-wordcloud'
import { useWindowSize } from '@vueuse/core'
import { exportToExcel } from '@/utils/dataExport'
import { getNodeListAPI } from '@/apis/clickstream_node'
import { ElFormItem, ElTable } from 'element-plus'
import { useDateStore } from '@/stores/dateStore'

const { height } = useWindowSize()

const router: Router = useRouter()
const route: RouteLocationNormalizedLoaded = useRoute()

const dateStore = useDateStore()

const clsDataList: Ref<ClsItem[]> = ref([])
const currDate: Ref<string> = ref(route.params.date as string)
const lang: Ref<string> = ref(route.params.lang as string)
const tableRef: Ref<InstanceType<typeof ElTable> | null> = ref(null)

interface ClsItem {
  id: number
  name: string
  dictIdx: string
  dcDictIdx: string
  density: number
  label: number
  value: number
  expand: boolean
  members: ClsItem[]
  membersName: string
}

const getNodeList = async () => {
  const res = await getNodeListAPI(lang.value, currDate.value, pageNum.value, pageSize.value, queryParams.value.keyword)
  clsDataList.value = res.data.list
  total.value = res.data.total
  clsDataList.value.forEach(i => {
    i.value = i.density
    i.membersName = i.members.map(i => i.name).join(', ')
    i.expand = false
  })
  tableRef.value!.setScrollTop(0)
}

onMounted(async () => {
  await getNodeList()
})

const total: Ref<number> = ref(0)
const pageNum: Ref<number> = ref(parseInt(route.query.pageNum as string) || 1)
const pageSize: Ref<number> = ref(parseInt(route.query.pageSize as string) || 10)

interface QueryObj {
  [key: string]: string | number
}
const paramsJump = () => {
  let queryObj: QueryObj = { keyword: '', pageNum: 1, pageSize: 10 }
  if (queryParams.value.keyword) queryObj.keyword = queryParams.value.keyword
  queryObj = {
    ...queryObj,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  }
  router.push({
    name: 'Home',
    query: queryObj
  })
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  paramsJump()
}
const handleCurrentChange = (val: number) => {
  pageNum.value = val
  paramsJump()
}

const queryParams = ref({ keyword: (route.query.keyword as string) || '' })
const search = () => {
  paramsJump()
}

const exportDataList: Ref<ClsItem[]> = ref([])
const showDialog: Ref<boolean> = ref(false)
const fileName: Ref<string> = ref(`${route.params.lang}-${route.params.date}`)
const getAllData = async () => {
  const res = await getNodeListAPI(lang.value, currDate.value, 1, total.value)
  exportDataList.value = res.data.list
  exportDataList.value.forEach(i => {
    i.value = i.density
    i.membersName = i.members.map(i => i.name).join(', ')
  })
}
const onClickExportToExcel = async () => {
  await getAllData()
  showDialog.value = true
}

const toWordCloud = (label?: number | undefined) => {
  if (label) router.push({ name: 'WordCloud', query: { label } })
  else router.push({ name: 'WordCloud' })
}

const toGraph = (label?: number | undefined) => {
  if (label) router.push({ name: 'Graph', query: { label } })
  else router.push({ name: 'Graph' })
}

const toHeatMap = () => {
  let nearestDate = dateStore.getNearestDate(currDate.value)
  router.push({ name: 'HeatMap', query: { xDate: currDate.value, yDate: nearestDate } })
}

onBeforeRouteUpdate(async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  if (to.name === from.name && (to.params.date !== from.params.date || to.params.lang !== from.params.lang)) {
    currDate.value = to.params.date as string
    lang.value = to.params.lang as string
    pageNum.value = 1
    pageSize.value = 10
    queryParams.value.keyword = ''
  } else if (to.query.keyword && !from.query.keyword) {
    pageNum.value = 1
    pageSize.value = 10
  } else if (!to.query.keyword && from.query.keyword) {
    pageNum.value = 1
    pageSize.value = 10
    queryParams.value.keyword = ''
  }
  await getNodeList()
})
</script>

<template>
  <div class="main">
    <div class="operation-container">
      <div class="search">
        <!-- 搜索框 -->
        <el-input
          @keyup.enter="search"
          class="search-input"
          clearable
          placeholder="搜索关键字"
          v-model="queryParams.keyword"
        >
          <template #prefix>
            <i-ep-search></i-ep-search>
          </template>
        </el-input>
        <el-button class="search-btn" type="primary" @click="search" v-blur-fix>
          <i-ep-search style="padding-left: 4px"></i-ep-search>
        </el-button>
      </div>
      <el-button class="export-btn" type="primary" @click="onClickExportToExcel" v-blur-fix>导出Excel</el-button>
      <el-button class="word-cloud-btn" type="primary" plain @click="toWordCloud()">查看中心词词云图</el-button>
      <el-button class="graph-btn" type="primary" plain @click="toGraph()">查看中心词关系图</el-button>
      <el-button class="heat-map-btn" type="primary" plain @click="toHeatMap()">查看月份主题对比图</el-button>
    </div>
    <div class="main-container">
      <div class="table-box">
        <el-table
          :data="clsDataList"
          :header-cell-style="{
            padding: '8px 0',
            background: '#f5f7fa'
          }"
          style="width: 100%"
          :style="{ height: height - 167 + 'px' }"
          border
          stripe
          ref="tableRef"
        >
          <el-table-column prop="label" label="主题" width="90" />
          <el-table-column prop="name" label="中心词" width="240" />
          <el-table-column prop="density" label="密度" width="90" />
          <el-table-column prop="members" label="外围词">
            <template #default="scope">
              <el-tooltip :content="scope.row.membersName" placement="top-start" disabled>
                <span v-if="scope.row.membersName.length <= 400">
                  {{ scope.row.membersName }}
                </span>
                <span v-else>
                  {{ scope.row.expand ? scope.row.membersName : scope.row.membersName.substr(0, 400).concat('...') }}
                  <span class="expand" @click="scope.row.expand = !scope.row.expand">
                    {{ scope.row.expand ? '收起' : '展开' }}
                  </span>
                </span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="总词数" width="90">
            <template #default="scope">
              {{ scope.row.members.length + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="110">
            <template #default="scope">
              <div class="button-cell">
                <el-button size="small" @click="toWordCloud(scope.row.label)">查看词云图</el-button>
                <el-button size="small" @click="toGraph(scope.row.label)">查看关系图</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-box">
        <el-pagination
          :current-page="pageNum"
          :page-size="pageSize"
          :page-sizes="[5, 10, 15, 20]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <!-- 导出模态框 -->
    <el-dialog v-model="showDialog" title="导出预览" width="80%" @close="showDialog = false">
      <el-form-item label="文件名：">
        <el-input v-model="fileName" placeholder="请输入导出文件的文件名"></el-input>
      </el-form-item>
      <el-table
        id="el-table"
        :data="exportDataList"
        :header-cell-style="{
          padding: '8px 0',
          background: '#f5f7fa'
        }"
        style="width: 100%; margin-top: 10px"
        :style="{ height: 0.5 * height + 'px' }"
        border
        stripe
      >
        <el-table-column prop="label" label="主题" width="90" />
        <el-table-column prop="name" label="中心词" width="240" />
        <el-table-column prop="density" label="密度" width="90" />
        <el-table-column prop="members" label="外围词">
          <template #default="scope">
            {{ scope.row.membersName }}
          </template>
        </el-table-column>
        <el-table-column label="总词数" width="90">
          <template #default="scope">
            {{ scope.row.members.length + 1 }}
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDialog = false">取消</el-button>
          <el-button type="primary" @click="exportToExcel('el-table', fileName)" v-blur-fix>确认导出</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss">
.main {
  position: fixed;
  width: calc(100% - 200px);
  height: 100%;
  padding-top: 60px;
  box-sizing: border-box;
  background-color: #fff;

  .operation-container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 999;
    display: flex;
    align-items: center;
    overflow: auto;
    box-sizing: border-box;
    width: 100%;
    height: 60px;
    padding: 0 25px;
    background-color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    .search {
      text-wrap: nowrap;
      .search-input {
        width: 300px;
        .el-input__wrapper {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
      }
      .search-btn {
        margin-left: -5px;
      }
    }
    .export-btn {
      margin-left: 15px;
    }
  }

  .main-container {
    height: 100%;
    overflow: auto;
    transition: all 0.2s ease-in-out;
    .table-box {
      box-sizing: border-box;
      width: 100%;
      padding: 25px 25px 0;
      background-color: #fff;

      .button-cell {
        display: flex;
        justify-content: center;
        align-items: space-around;
        flex-wrap: wrap;

        .el-button {
          margin: 4px;
        }
      }
    }

    .pagination-box {
      padding: 25px;
      background-color: #fff;
    }
  }

  .expand {
    color: var(--el-color-primary);

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
