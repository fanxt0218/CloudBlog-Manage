<template>
  <el-dialog
    v-model="visible"
    :title="configTitle"
    width="800px"
    destroy-on-close
    class="config-detail-dialog"
  >
    <div class="dialog-body" v-loading="loading">
      <div class="action-bar">
        <el-button type="primary" :icon="Plus" @click="openAddDialog">新增配置项</el-button>
        <el-button type="success" :icon="Check" @click="handleBatchSave">保存更改 (排序/发布状态)</el-button>
      </div>

      <el-table :data="configList" border style="width: 100%; margin-top: 20px" row-key="id">
        <el-table-column prop="sortOrder" label="排序" width="90">
          <template #default="{ row }">
            <el-input-number v-model="row.sortOrder" :min="0" controls-position="right" size="small" style="width: 60px" />
          </template>
        </el-table-column>
        
        <el-table-column label="预览/值" min-width="100" align="center">
          <template #default="{ row }">
            <div class="content-preview">
              <el-image 
                v-if="row.contentValue" 
                :src="getResourceUrl(row.contentValue)" 
                fit="cover" 
                :class="['table-img', (configType === 'carousel') ? 'wide-img' : '']"
                :preview-src-list="[getResourceUrl(row.contentValue)]"
                preview-teleported
              >
                <template #error>
                  <span class="text-value">{{ row.contentValue }}</span>
                </template>
              </el-image>
              <span v-else class="text-value">-</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column v-if="configType === 'recommend_tool'" label="工具信息" min-width="200">
          <template #default="{ row }">
            <div class="attr-info" v-if="row.attributesMap">
              <div class="attr-item"><strong>标题:</strong> {{ row.attributesMap.title }}</div>
              <div class="attr-item"><strong>标签:</strong> <el-tag size="small">{{ row.attributesMap.tag }}</el-tag></div>
              <div class="attr-item"><strong>热度:</strong> {{ row.attributesMap.hotNum }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="isPublic" label="发布状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.isPublic"
              :active-value="1"
              :inactive-value="0"
              inline-prompt
              active-text="公"
              inactive-text="私"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑单个项的对话框 (内层) -->
    <el-dialog
      v-model="formDialogVisible"
      :title="isEdit ? '编辑配置项' : '新增配置项'"
      width="500px"
      append-to-body
    >
      <el-form :model="form" label-width="100px" ref="formRef">
        <el-form-item label="类型">
          <el-tag>{{ configType }}</el-tag>
        </el-form-item>
        
        <el-form-item label="图片/资源" required>
          <el-upload
            :class="['avatar-uploader', (configType === 'carousel') ? 'wide-uploader' : '']"
            action=""
            :show-file-list="false"
            :http-request="handleUpload"
            v-loading="uploading"
          >
            <img v-if="form.contentValue" :src="getResourceUrl(form.contentValue)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">点击上传图片。上传后将自动填充URL。</div>
        </el-form-item>

        <el-form-item label="资源URL" prop="contentValue">
          <el-input v-model="form.contentValue" placeholder="手动输入或上传自动生成" />
        </el-form-item>

        <template v-if="configType === 'recommend_tool'">
          <el-form-item label="工具名称" required>
            <el-input v-model="form.attrs.title" placeholder="如: OpenAI" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.attrs.desc" type="textarea" placeholder="工具描述" />
          </el-form-item>
          <el-form-item label="标签">
            <el-input v-model="form.attrs.tag" placeholder="如: AI, 效率" />
          </el-form-item>
          <el-form-item label="热度值">
            <el-input v-model="form.attrs.hotNum" placeholder="如: 18.2K" />
          </el-form-item>
          <el-form-item label="跳转链接">
            <el-input v-model="form.attrs.url" placeholder="https://..." />
          </el-form-item>
        </template>

        <el-form-item label="排序权重">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ isEdit ? '保存修改' : '确定新增' }}</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { Plus, Delete, Check, Edit } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  getWebsiteConfig, 
  uploadImage, 
  addWebsiteConfig, 
  deleteWebsiteConfig, 
  updateIndexWebsiteConfig 
} from '@/api/WebSiteManage';
import type { WebsiteComponentDefine } from '@/types';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  configType: string;
  configTitle: string;
  configCategory?: string;
}>(), {
  configCategory: 'HOME'
});

const emit = defineEmits(['update:modelValue', 'refresh']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const loading = ref(false);
const configList = ref<any[]>([]);
const formDialogVisible = ref(false);
const uploading = ref(false);
const submitting = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);

const form = ref({
  contentValue: '',
  sortOrder: 0,
  attrs: {
    title: '',
    desc: '',
    tag: '',
    hotNum: '',
    url: ''
  }
});

// 加载数据
const loadData = async () => {
  if (!props.configType) return;
  loading.value = true;
  try {
    const res: any = await getWebsiteConfig({
      category: props.configCategory,
      contentType: props.configType
    });
    if (res.code === 200) {
      configList.value = res.data;
    }
  } catch (err) {
    ElMessage.error('加载配置失败');
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

watch(() => props.configType, loadData);

const getResourceUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `/api${url}`;
};

const handleUpload = async (options: any) => {
  const { file } = options;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', props.configCategory);
  formData.append('contentType', props.configType);

  uploading.value = true;
  try {
    const res: any = await uploadImage(formData);
    if (res.code === 200) {
      form.value.contentValue = res.data; // 假设返回的是URL
      ElMessage.success('上传成功');
    }
  } catch (err) {
    ElMessage.error('上传失败');
  } finally {
    uploading.value = false;
  }
};

const openAddDialog = () => {
  isEdit.value = false;
  currentId.value = null;
  form.value = {
    contentValue: '',
    sortOrder: configList.value.length + 1,
    attrs: { title: '', desc: '', tag: '', hotNum: '', url: '' }
  };
  formDialogVisible.value = true;
};

const handleEdit = (row: any) => {
  isEdit.value = true;
  currentId.value = row.id;
  form.value = {
    contentValue: row.contentValue,
    sortOrder: row.sortOrder,
    attrs: row.attributesMap ? { ...row.attributesMap } : { title: '', desc: '', tag: '', hotNum: '', url: '' }
  };
  formDialogVisible.value = true;
};

const submitForm = async () => {
  if (!form.value.contentValue) {
    return ElMessage.warning('请提供资源内容或上传图片');
  }

  submitting.value = true;
  try {
    if (isEdit.value && currentId.value) {
      // 执行更新 (使用 batch update 接口更新单项)
      const data: any = {
        webSiteComponentPo: {
          category: props.configCategory,
          contentType: props.configType
        },
        siteContentList: [{
          id: currentId.value,
          contentValue: form.value.contentValue,
          sortOrder: form.value.sortOrder,
          attributesMap: props.configType === 'recommend_tool' ? form.value.attrs : {}
        }]
      };
      const res: any = await updateIndexWebsiteConfig(data);
      if (res.code === 200) {
        ElMessage.success('更新成功');
        formDialogVisible.value = false;
        loadData();
        emit('refresh');
      }
    } else {
      // 执行新增
      const data: any = {
        contentType: props.configType,
        category: props.configCategory,
        contentValue: form.value.contentValue,
        sortOrder: form.value.sortOrder.toString(),
        attributesMap: props.configType === 'recommend_tool' ? form.value.attrs : {}
      };
      const res: any = await addWebsiteConfig(data);
      if (res.code === 200) {
        ElMessage.success('新增成功');
        formDialogVisible.value = false;
        loadData();
        emit('refresh');
      }
    }
  } catch (err) {
    ElMessage.error(isEdit.value ? '保存失败' : '新增失败');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除这项配置吗？', '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await deleteWebsiteConfig({ id: row.id });
      if (res.code === 200) {
        ElMessage.success('删除成功');
        loadData();
        emit('refresh');
      }
    } catch (err) {
      ElMessage.error('删除失败');
    }
  });
};

const handleBatchSave = async () => {
  loading.value = true;
  try {
    const data: any = {
      webSiteComponentPo: {
        category: props.configCategory,
        contentType: props.configType
      },
      siteContentList: configList.value.map(item => ({
        id: item.id,
        sortOrder: item.sortOrder,
        contentValue: item.contentValue,
        attributesMap: item.attributesMap,
        isPublic: item.isPublic // 假设接口支持修改isPublic
      }))
    };
    
    // 注意：updateIndexWebsiteConfig 的定义中 siteContentList 里的对象
    // id:number, sortOrder?:number, contentValue?:string, attributes?:string
    // 这里我还传了 isPublic，如果不支，可能需要后台配合
    
    const res: any = await updateIndexWebsiteConfig(data);
    if (res.code === 200) {
      ElMessage.success('更新成功');
      loadData();
    }
  } catch (err) {
    ElMessage.error('保存失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.action-bar {
  display: flex;
  gap: 12px;
}

.table-img {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  &.wide-img {
    width: 460px;
  }
}

.attr-info {
  font-size: 12px;
  color: #606266;
  .attr-item {
    margin-bottom: 2px;
  }
}

.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 178px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;

  &.wide-uploader {
    width: 356px;
  }

  &:hover {
    border-color: var(--el-color-primary);
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 100%;
  height: 100px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.text-value {
  font-size: 13px;
  color: #606266;
}
</style>
