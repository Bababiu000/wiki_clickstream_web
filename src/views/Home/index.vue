<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import 'echarts-wordcloud'
import { useWindowSize } from '@vueuse/core'
import { exportToExcel } from '@/utils/dataExport.js'
import { getListAPI } from '@/apis/clickstream.js'
import { ElFormItem } from 'element-plus'

const { height } = useWindowSize()

const route = useRoute()
const router = useRouter()
const clsDataList = ref([])

const curDate = ref(route.params.date)

const getList = async () => {
  const res = await getListAPI(
    curDate.value,
    pageNum.value,
    pageSize.value,
    queryParams.value.keyword
  )
  clsDataList.value = res.data.list
  total.value = res.data.total
  clsDataList.value.forEach(i => {
    i.value = i.density
    i.members_name = i.members.map(i => i.name).join(', ')
    i.expand = false
  })
}

onMounted(async () => {
  await getList()
})

const total = ref(0)
const pageNum = ref(parseInt(route.query.pageNum) || 1)
const pageSize = ref(parseInt(route.query.pageSize) || 10)

const paramsJump = () => {
  let queryObj = {}
  if (queryParams.value.keyword) queryObj.keyword = queryParams.value.keyword
  queryObj = {
    ...queryObj,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  }
  router.push({
    path: `/${curDate.value}`,
    query: queryObj
  })
}

const handleSizeChange = val => {
  pageSize.value = val
  paramsJump()
}
const handleCurrentChange = val => {
  pageNum.value = val
  paramsJump()
}

const queryParams = ref({ keyword: route.query.keyword || '' })
const search = () => {
  paramsJump()
}

const exportDataList = ref([])
const showDialog = ref(false)
const fileName = ref(route.params.date)
const getAllData = async () => {
  const res = await getListAPI(curDate.value, 1, total.value)
  console.log(res)
  exportDataList.value = res.data.list
  exportDataList.value.forEach(i => {
    i.value = i.density
    i.members_name = i.members.map(i => i.name).join(', ')
  })
}
const onClickExportToExcel = async () => {
  await getAllData()
  showDialog.value = true
}

const toWordCloud = center => {
  if (center) router.push({ path: `/word-cloud/${curDate.value}`, query: { center: center } })
  else router.push({ path: `/word-cloud/${curDate.value}` })
}

const toTree = center => {
  if (center) router.push({ path: `/graph/${curDate.value}`, query: { center: center } })
  else router.push({ path: `/graph/${curDate.value}` })
}

onBeforeRouteUpdate(async (to, from) => {
  if (to.name === from.name && to.params.date !== from.params.date) {
    curDate.value = to.params.date
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
  await getList()
})
</script>

<template>
  <div class="home">
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
        <el-button class="search-btn" type="primary" @click="search">
          <i-ep-search style="padding-left: 4px"></i-ep-search>
        </el-button>
      </div>
      <el-button class="export-btn" type="primary" @click="onClickExportToExcel">
        导出Excel
      </el-button>
      <el-button class="word-cloud-btn" type="primary" plain @click="toWordCloud()">
        查看中心词词云图
      </el-button>
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
        >
          <el-table-column prop="label" label="主题" width="90" />
          <el-table-column prop="name" label="中心词" width="240" />
          <el-table-column prop="density" label="密度" width="90" />
          <el-table-column prop="members" label="外围词">
            <template #default="scope">
              <el-tooltip :content="scope.row.members_name" placement="top-start" disabled>
                <span v-if="scope.row.members_name.length <= 400">
                  {{ scope.row.members_name }}
                </span>
                <span v-else>
                  {{
                    scope.row.expand
                      ? scope.row.members_name
                      : scope.row.members_name.substr(0, 400).concat('...')
                  }}
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
                <el-button size="small" @click="toWordCloud(scope.row.dcDictIdx)">
                  查看词云图
                </el-button>
                <el-button size="small" @click="toTree(scope.row.dcDictIdx)">查看关系图</el-button>
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
        <el-table-column prop="name" label="中心词" width="240" />
        <el-table-column prop="density" label="密度" width="90" />
        <el-table-column prop="members" label="外围词">
          <template #default="scope">
            {{ scope.row.members_name }}
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
          <el-button type="primary" @click="exportToExcel('el-table', fileName)">
            确认导出
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss">
.home {
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
