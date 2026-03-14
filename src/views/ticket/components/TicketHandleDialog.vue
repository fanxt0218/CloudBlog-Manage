<template>
  <el-dialog
    :model-value="visible"
    title="处理工单"
    width="500px"
    append-to-body
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="当前状态">
        <el-tag :type="getStatusTag(order?.status ?? 0)" size="small" effect="dark">
          {{ formatStatus(order?.status ?? 0) }}
        </el-tag>
      </el-form-item>
      
      <el-form-item label="处理状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="1">处理中</el-radio>
          <el-radio :label="2">处理完成</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="处理结果" prop="handleReason">
        <el-input
          v-model="form.handleReason"
          type="textarea"
          :rows="4"
          placeholder="请输入处理结果说明（选填，如禁用账号、已删除违规内容等）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确认处理
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { handleWorkOrder } from '@/api/workOrderManage'
import type { WorkOrderListItem } from '@/types/index'

const props = defineProps<{
  visible: boolean
  order: WorkOrderListItem | null
}>()

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref<FormInstance>()
const form = reactive({
  status: 1, // 默认为处理中
  handleReason: ''
})

const rules = reactive<FormRules>({
  status: [
    { required: true, message: '请选择处理状态', trigger: 'change' }
  ]
})

const submitLoading = ref(false)

watch(() => props.visible, (newVal) => {
  if (newVal && props.order) {
    form.status = props.order.status === 0 ? 1 : props.order.status
    form.handleReason = props.order.handleReason || ''
  } else {
    // reset defaults on close
    form.status = 1
    form.handleReason = ''
  }
})

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

const handleClose = () => {
  if (formRef.value) {
    formRef.value.clearValidate()
  }
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formRef.value || !props.order) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await handleWorkOrder({
          id: props.order!.id, // using `id` per interface
          status: form.status,
          handleReason: form.handleReason
        })
        ElMessage.success('工单处理成功')
        emit('success')
        handleClose()
      } catch (error) {
        ElMessage.error('处理失败')
        console.error(error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}
</script>
