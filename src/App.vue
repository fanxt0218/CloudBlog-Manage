<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
</script>

<style>
/* Basic reset */
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
</style>
