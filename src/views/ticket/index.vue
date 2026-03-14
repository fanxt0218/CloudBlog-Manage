<template>
  <div class="ticket-manage-container">
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="工单号">
          <el-input v-model="queryParams.orderId" placeholder="工单编号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="发起人">
          <el-input v-model="queryParams.userName" placeholder="发起人用户名" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        
        <el-form-item label="目标类型">
          <el-select v-model="queryParams.targetType" placeholder="请选择" clearable style="width: 140px">
            <el-option label="文章" value="0" />
            <el-option label="动态" value="1" />
            <el-option label="评论" value="2" />
            <el-option label="账号" value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="工单类型">
          <el-select v-model="queryParams.orderType" placeholder="请选择" clearable style="width: 140px">
            <el-option label="内容举报" value="0" />
            <el-option label="BUG反应" value="1" />
            <el-option label="意见建议" value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="处理状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 140px">
            <el-option label="未处理" value="0" />
            <el-option label="处理中" value="1" />
            <el-option label="处理完成" value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleDateChange"
            style="width: 360px;"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container" v-loading="loading">
      <el-table :data="tableData" border style="width: 100%" stripe>
        <el-table-column prop="orderId" label="工单号" min-width="160" show-overflow-tooltip align="center" />
        <el-table-column prop="userName" label="发起人" min-width="120" show-overflow-tooltip />
        
        <el-table-column label="目标类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTargetTypeTag(row.targetType)" size="small">
              {{ formatTargetType(row.targetType) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="工单类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getOrderTypeTag(row.orderType)" size="small">
              {{ formatOrderType(row.orderType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="reason" label="原因/详情" min-width="200" show-overflow-tooltip />
        <el-table-column prop="handleReason" label="处理结果" min-width="150" show-overflow-tooltip />

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small" effect="dark">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="170" align="center" :formatter="TimeUtil.formatTime" />
        
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleProcess(row)" :disabled="row.status === 2">
              {{ row.status === 0 ? '处理' : (row.status === 1 ? '继续处理' : '已完成') }}
            </el-button>
            <el-button type="info" link size="small" @click="handleViewDetails(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pageParams.pageNum"
          v-model:page-size="pageParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <TicketDetailDialog 
      v-model:visible="detailDialogVisible"
      :order="currentOrder"
      @process="handleProcessFromDetail"
    />

    <!-- 处理弹窗 -->
    <TicketHandleDialog
      v-model:visible="handleDialogVisible"
      :order="currentOrder"
      @success="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getWorkOrderList } from '@/api/workOrderManage'
import type { WorkOrderListItem } from '@/types/index'
import { TimeUtil } from '@/utils/TimeUtil'

// 引入子组件
import TicketDetailDialog from './components/TicketDetailDialog.vue'
import TicketHandleDialog from './components/TicketHandleDialog.vue'

const loading = ref(false)
const tableData = ref<WorkOrderListItem[]>([])
const total = ref(0)
const dateRange = ref<[string, string] | null>(null)

// 分页数据
const pageParams = ref({
  pageNum: 1,
  pageSize: 10
})

const detailDialogVisible = ref(false)
const handleDialogVisible = ref(false)
const currentOrder = ref<WorkOrderListItem | null>(null)

// 搜索条件，都格式化为外层字符串以匹配API要求
const queryParams = ref({
  orderId: '',
  userName: '',
  targetType: '',
  orderType: '',
  status: '',
  startTime: '',
  endTime: ''
})

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...queryParams.value,
      pageNum: String(pageParams.value.pageNum),
      pageSize: String(pageParams.value.pageSize)
    }
    const res = await getWorkOrderList(params)
    const data = res.data?.data || res.data || res
    tableData.value = data.records || data.content || []
    total.value = data.total || data.totalElements || 0
  } catch (error) {
    console.error(error)
    ElMessage.error('获取工单列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pageParams.value.pageNum = 1
  fetchData()
}

const handleReset = () => {
  queryParams.value = {
    orderId: '',
    userName: '',
    targetType: '',
    orderType: '',
    status: '',
    startTime: '',
    endTime: ''
  }
  dateRange.value = null
  pageParams.value.pageNum = 1
  fetchData()
}

const handleDateChange = (val: [string, string] | null) => {
  if (val) {
    queryParams.value.startTime = val[0]
    queryParams.value.endTime = val[1]
  } else {
    queryParams.value.startTime = ''
    queryParams.value.endTime = ''
  }
}

const handleSizeChange = (val: number) => {
  pageParams.value.pageSize = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  pageParams.value.pageNum = val
  fetchData()
}

const handleProcess = (row: WorkOrderListItem) => {
  currentOrder.value = row
  handleDialogVisible.value = true
}

// 被详情组件内部触发的处理事件
const handleProcessFromDetail = (row: WorkOrderListItem) => {
  handleProcess(row)
}

const handleViewDetails = async (row: WorkOrderListItem) => {
  currentOrder.value = row
  detailDialogVisible.value = true
}

// 格式化函数
const formatTargetType = (type: number | string) => {
  const map: Record<string, string> = {
    '0': '文章',
    '1': '动态',
    '2': '评论',
    '3': '账号'
  }
  return map[String(type)] || '未知'
}

const getTargetTypeTag = (type: number | string) => {
  const map: Record<string, string> = {
    '0': 'primary',
    '1': 'success',
    '2': 'warning',
    '3': 'danger'
  }
  return map[String(type)] || 'info'
}

const formatOrderType = (type: number | string) => {
  const map: Record<string, string> = {
    '0': '内容举报',
    '1': 'BUG',
    '2': '建议'
  }
  return map[String(type)] || '未知'
}

const getOrderTypeTag = (type: number | string) => {
  const map: Record<string, string> = {
    '0': 'danger',
    '1': 'warning',
    '2': 'success'
  }
  return map[String(type)] || 'info'
}

const formatStatus = (status: number | string) => {
  const map: Record<string, string> = {
    '0': '未处理',
    '1': '处理中',
    '2': '处理完成'
  }
  return map[String(status)] || '未知'
}

const getStatusTag = (status: number | string) => {
  const map: Record<string, string> = {
    '0': 'info',
    '1': 'warning',
    '2': 'success'
  }
  return map[String(status)] || 'info'
}

onMounted(() => {
  fetchData()
  document.title = '工单管理 - CloudBlog管理后台'
})
</script>

<style scoped>
.ticket-manage-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.search-wrapper {
  background: #fff;
  padding: 24px 24px 4px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
