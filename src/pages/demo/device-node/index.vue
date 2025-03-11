<script lang="ts" setup>
import type { CreateOrUpdateTableRequestData, DeviceIdData, TableData } from "@@/apis/tables/type"
import type { FormInstance, FormRules } from "element-plus"
import { createTableDataApi, deleteTableDataApi, getDeviceIdDataApi, updateTableDataApi } from "@@/apis/tables"
import { usePagination } from "@@/composables/usePagination"
import { CirclePlus, Delete, Download, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { cloneDeep } from "lodash-es"
import ConfigDataTable from "./ConfigDataComponent.vue"
import SensorDataTable from "./SensorDataComponet.vue"

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})

const loading = ref<boolean>(false)
const selectedDeviceId = ref("")
const activeTab = ref<"sensor" | "config">("sensor")// 当前激活的标签页
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)

// #region 改
// function handleUpdate(row: TableData) {
//   dialogVisible.value = true
//   formData.value = cloneDeep(row)
// }
// #endregion

// #region 查
const tableData = ref<TableData[]>([])
const DeviceIdData = ref<DeviceIdData[]>([])
// const searchFormRef = ref<FormInstance | null>(null)
// const searchData = reactive({
//   username: "",
//   phone: ""
// })

function parseDeviceData(jsonString: string): DeviceIdData[] {
  // jsonString = "{\"2c7c6797442f9f25\":\"\"}"
  if (!jsonString || typeof jsonString !== "string") {
    console.error("Invalid JSON string input")
    return []
  }

  let jsonObject: Record<string, unknown>
  try {
    // 尝试解析 JSON 字符串
    jsonObject = JSON.parse(jsonString)
  } catch (error) {
    console.error("Failed to parse JSON string:", error)
    return []
  }

  // 校验解析后的对象是否为非空对象
  if (typeof jsonObject !== "object" || jsonObject === null || Array.isArray(jsonObject)) {
    console.error("Parsed JSON is not a valid object")
    return []
  }

  // 将对象转换为 DeviceIdData 数组
  const parsedData: DeviceIdData[] = Object.entries(jsonObject).map(([key, value]) => {
    console.info(typeof value)
    // 显式断言 value 的类型
    if (typeof value === "number" || typeof value === "string") {
      return {
        deviceid: key, // 将 key 映射到 sensor
        val: value // 将 value 映射到 val
      }
    } else {
      // 如果 value 不是 number 类型，记录警告并返回默认值
      console.warn(`Value for key "${key}" is not a number: ${value}`)
      return {
        deviceid: key,
        val: 0 // 默认值
      }
    }
  })

  return parsedData
}

function getSensorData() {
  loading.value = true
  getDeviceIdDataApi({
  }).then(({ data }) => {
    console.log(data.json)
    const parsedData = parseDeviceData(data.json)
    paginationData.total = parsedData.length
    DeviceIdData.value = parsedData
    console.log(parsedData)
  }).catch(() => {
    DeviceIdData.value = []
  }).finally(() => {
    loading.value = false
  })
}

// function handleSearch() {
//   paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
// }
// function resetSearch() {
//   searchFormRef.value?.resetFields()
//   handleSearch()
// }
// #endregion

// 监听分页参数的变化
watch([() => paginationData.currentPage, () => paginationData.pageSize], getSensorData, { immediate: true })

// 处理标签页点击事件
function handleTabClick(tab: { props: { name: "sensor" | "config" } }) {
  console.log("Tab clicked:", tab.props.name)
}
</script>

<template>
  <div pa-10px h-auto text-center flex select-none all:transition-400>
    <div ma>
      <div text-3xl fw100 animate-bounce-alt animate-count-infinite animate-duration-1s>
        Device Node
      </div>
    </div>
  </div>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never">
      <div class="table-wrapper">
        <span style="margin-right: 10px;">deviceid</span>
        <el-select v-model="selectedDeviceId" placeholder="请选择设备" style="width: 100%">
          <el-option
            v-for="device in DeviceIdData"
            :key="device.deviceid"
            :label="`${device.deviceid}  ${device.val}`"
            :value="device.deviceid"
          />
        </el-select>
      </div>

      <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabClick">
        <el-tab-pane label="Sensor Data" name="sensor">
          <SensorDataTable :device-id="selectedDeviceId" v-if="activeTab === 'sensor'" />
        </el-tab-pane>
        <el-tab-pane label="Config Data" name="config">
          <ConfigDataTable :device-id="selectedDeviceId" v-if="activeTab === 'config'" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.el-alert {
  margin-bottom: 20px;
}

.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
