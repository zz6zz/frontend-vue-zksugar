<script lang="ts" setup>
import type { DeviceConfigData, DevicePropertySetData } from "@@/apis/tables/type"
import { getDeviceConfigDataApi, getDevicePropertySetDataApi, getDevicePropertySetTemplateDataApi, updateDevicePropertySetDataApi } from "@@/apis/tables"
import { ref, watch } from "vue"

// 定义 props
const props = defineProps<{
  deviceId: string | number
}>()

const loading = ref<boolean>(false)
// 左侧文本框的值
const leftInputValue = ref("Read Only")
const formattedTime = ref<string>("")
// 右侧文本框的值
const rightInputValue = ref("")
// 定时器 ID
let refreshTimer: number | null = null
// 从环境变量中读取定时器间隔时间，并转换为数字类型
const refreshInterval = Number(import.meta.env.VITE_REFRESH_INTERVAL) || 1000 // 默认 1000 毫秒

function formatLastOnlineTime() {
  const date = new Date(timestamp)
  formattedTime.value = date.toLocaleString() // 格式化为本地时间字符串
}

// 获取配置数据
function getConfigData(deviceId: string | number) {
  loading.value = true
  getDeviceConfigDataApi({
    device_id: deviceId
  })
    .then(({ data }) => {
      const jsonData = JSON.parse(data.json)

      leftInputValue.value = JSON.stringify(jsonData, null, 2)

      const timestamp = jsonData.last_online_time * 1000 // 转换为毫秒
      const date = new Date(timestamp)
      formattedTime.value = date.toLocaleString() // 格式化为本地时间字符串
    })
    .catch(() => {
      ElMessage.error("获取Device已配置失败")
    })
    .finally(() => {
      loading.value = false
    })
}

function getPropertySetData(deviceId: string | number) {
  loading.value = true
  getDevicePropertySetDataApi({
    device_id: deviceId
  })
    .then(({ data }) => {
      rightInputValue.value = JSON.stringify(JSON.parse(data.json), null, 4)
    })
    .catch(() => {
      ElMessage.error("获取服务端配置失败")
    })
    .finally(() => {
      loading.value = false
    })
}

// 启动定时刷新
function startRefresh() {
  if (props.deviceId) {
    refreshTimer = setInterval(() => {
      getConfigData(props.deviceId)
    }, refreshInterval) // 每隔 1 秒刷新一次
  }
}
// 停止定时刷新
function stopRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 组件挂载时启动定时刷新
onMounted(() => {
  startRefresh()
})

// 组件卸载时停止定时刷新
onUnmounted(() => {
  stopRefresh()
})

// 监听 deviceId 的变化
watch(
  () => props.deviceId,
  (newDeviceId) => {
    if (newDeviceId) {
      // 停止之前的定时器
      stopRefresh()
      getConfigData(newDeviceId)
      getPropertySetData(newDeviceId)
      // 启动新的定时器
      startRefresh()
    }
  },
  { immediate: true }
)

// 提交逻辑
function handleSubmit() {
  if (rightInputValue.value.trim() === "") {
    ElMessage.warning("请输入内容后再提交！")
    return
  }
  updateDevicePropertySetDataApi({
    device_id: props.deviceId,
    json: rightInputValue.value
  })
    .finally(() => {
      ElMessage.success(`提交成功`)
    })
}

// 获取默认模板的逻辑
function handleGetDefaultTemplate() {
  loading.value = true
  getDevicePropertySetDataApi({
    device_id: "template"
  })
    .then(({ data }) => {
      rightInputValue.value = JSON.stringify(JSON.parse(data.json), null, 4)
    })
    .catch(() => {
      ElMessage.error("获取默认模板失败")
    })
    .finally(() => {
      loading.value = false
    })
};
</script>

<template>
  <el-card v-loading="loading" shadow="never">
    <div class="container">
      <el-row :gutter="20">
        <el-col class="last-online-text" :span="12">
          Last Online: {{ formattedTime }}
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <!-- 左侧文本框 -->
        <el-col :span="12">
          <div class="input-group">
            <label class="input-title">Set On Device</label>
            <el-input
              v-model="leftInputValue"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 20 }"
              placeholder="Device已配置内容"
              readonly
            />
          </div>
        </el-col>

        <!-- 右侧文本框 -->
        <el-col :span="12">
          <div class="input-group">
            <label class="input-title">Set（支持修改键值对的值，不支持新增或删除）</label>
            <el-input
              v-model="rightInputValue"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 20 }"
              placeholder="请输入内容"
            />
            <el-button
              type="primary"
              @click="handleSubmit"
              class="submit-button"
            >
              提交
            </el-button>

            <el-button
              type="info"
              @click="handleGetDefaultTemplate"
              class="get-template-button"
            >
              重置
            </el-button>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.table-wrapper {
  margin-bottom: 20px;
}
.last-online-text {
  font-size: 14px; /* 字体大小 */
  color: gray; /* 字体颜色 */
  // border-top: 1px solid gray; /* 上边框 */
  // border-bottom: 1px solid gray; /* 下边框 */
  // padding: 8px 0; /* 添加内边距，让边框和文字之间有间距 */
}
</style>
