<template>
  <el-card 
    class="stat-card" 
    :class="{ 'is-clickable': clickable }"
    shadow="hover" 
    :body-style="{ padding: '20px' }"
    @click="$emit('click')"
  >
    <div class="stat-content">
      <el-badge :is-dot="showBadge" :offset="[0, 5]" class="badge-item">
        <div class="stat-icon" :style="{ backgroundColor: bgColor, color: iconColor }">
          <el-icon :size="24">
            <component :is="icon" />
          </el-icon>
        </div>
      </el-badge>
      <div class="stat-info">
        <div class="stat-title">{{ title }}</div>
        <div class="stat-value">
          <el-skeleton :loading="loading" animated>
            <template #template>
              <el-skeleton-item variant="h3" style="width: 60%" />
            </template>
            <template #default>
              <span>{{ value.toLocaleString() }}</span>
            </template>
          </el-skeleton>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: number
  icon: any
  bgColor?: string
  iconColor?: string
  loading?: boolean
  showBadge?: boolean
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  showBadge: false,
  clickable: false
})

defineEmits(['click'])
</script>

<style scoped>
.stat-card {
  border: none;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card.is-clickable {
  cursor: pointer;
}

.stat-card.is-clickable:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
}

.stat-content {
  display: flex;
  align-items: center;
}

.badge-item {
  margin-right: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}
</style>
