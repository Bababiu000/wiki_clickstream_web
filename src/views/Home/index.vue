<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import 'echarts-wordcloud'
import { getListAPI } from '@/apis/clickstream.js'

const route = useRoute()
const router = useRouter()
const clsDataList = ref([])

const curDate = ref(route.params.date)

const getList = async () => {
  const res = await getListAPI(curDate.value, pageNum.value, pageSize.value)
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

const handleSizeChange = val => {
  pageSize.value = val
  router.push({
    path: `/${curDate.value}`,
    query: { pageNum: pageNum.value, pageSize: pageSize.value }
  })
  getList()
}
const handleCurrentChange = val => {
  pageNum.value = val
  router.push({
    path: `/${curDate.value}`,
    query: { pageNum: pageNum.value, pageSize: pageSize.value }
  })
  getList()
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
  if (from.fullPath === to.fullPath) return
  else if (from.name === to.name && from.params.date !== to.params.date) {
    curDate.value = to.params.date
    pageNum.value = 1
    pageSize.value = 10
    await getList()
  }
})
</script>

<template>
  <div class="home">
    <div class="button-container">
      <el-button type="primary" plain @click="toWordCloud()">查看中心词词云图</el-button>
    </div>
    <div class="table-container">
      <el-table :data="clsDataList" :header-cell-style="{
        padding: '8px 0',
        background: '#f5f7fa'
      }" style="width: 95%" border stripe>
        <el-table-column prop="name" label="中心词" width="240" />
        <el-table-column prop="density" label="热度" width="90" />
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
    <div class="pagination-container">
      <el-pagination :current-page="pageNum" :page-size="pageSize" :page-sizes="[5, 10, 15, 20]"
        layout="total, sizes, prev, pager, next, jumper" :total="total" background @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%;
  padding: 25px;
  box-sizing: border-box;

  .table-container {
    margin-top: 20px;

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

  .pagination-container {
    margin-top: 20px;
  }

  .expand {
    color: var(--el-color-primary);

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
