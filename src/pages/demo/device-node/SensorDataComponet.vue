<script lang="ts" setup>
import type { SensorData } from "@@/apis/tables/type"
import { getSensorDataApi } from "@@/apis/tables"
import { ref, watch } from "vue"

// 定义 props
const props = defineProps<{
  deviceId: string | number
}>()

const loading = ref<boolean>(false)
const sensorData = ref<SensorData[]>([])
// 从环境变量中读取定时器间隔时间，并转换为数字类型
const refreshInterval = Number(import.meta.env.VITE_REFRESH_INTERVAL) || 1000 // 默认 1000 毫秒

// 解析传感器数据
function parseSensorData(jsonString: string): SensorData[] {
  // jsonString = '{"soil_moisture": 155, "soil_temperature": 0, "electrical_conductivity": 30, "ph_value": 0, "CT_coefficient": 55, "salinity": 0, "TDS_coefficient": 50, "temperature_calibration": 0, "moisture_calibration": 0, "electrical_calibration": 0, "ph_calibration": 0}';
  if (!jsonString || typeof jsonString !== "string") {
    console.error("Invalid JSON string input")
    return []
  }

  let jsonObject: Record<string, unknown>
  try {
    jsonObject = JSON.parse(jsonString)
  } catch (error) {
    console.error("Failed to parse JSON string:", error)
    return []
  }

  if (typeof jsonObject !== "object" || jsonObject === null || Array.isArray(jsonObject)) {
    console.error("Parsed JSON is not a valid object")
    return []
  }

  const parsedData: SensorData[] = Object.entries(jsonObject).map(([key, value]) => {
    if (typeof value === "number") {
      return {
        sensor: key,
        val: value
      }
    } else {
      console.warn(`Value for key "${key}" is not a number: ${value}`)
      return {
        sensor: key,
        val: 0
      }
    }
  })

  return parsedData
}

// 获取传感器数据
function getSensorData(deviceId: string | number) {
  loading.value = true
  getSensorDataApi({
    device_id: deviceId,
    datatype: "sensordata"
  })
    .then(({ data }) => {
      const parsedData = parseSensorData(data.json)
      sensorData.value = parsedData
    })
    .catch(() => {
      sensorData.value = []
      stopRefresh()
    })
    .finally(() => {
      loading.value = false
    })
}

// 定时器 ID
let refreshTimer: number | null = null
// 启动定时刷新
function startRefresh() {
  if (props.deviceId) {
    refreshTimer = setInterval(() => {
      getSensorData(props.deviceId)
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
      getSensorData(newDeviceId)
      // 启动新的定时器
      startRefresh()
    }
  },
  { immediate: true }
)
</script>

<template>
  <el-card v-loading="loading" shadow="never">
    <div class="table-wrapper">
      <el-table :data="sensorData">
        <el-table-column prop="sensor" label="sensor" align="center" />
        <el-table-column prop="val" label="val" align="center" />
      </el-table>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.table-wrapper {
  margin-bottom: 20px;
}
</style>
