<script lang="ts" setup>
import type { CreateOrUpdateTableRequestData, SensorData, TableData } from "@@/apis/tables/type"
import type { FormInstance, FormRules } from "element-plus"
import { createTableDataApi, deleteTableDataApi, getSensorDataApi, updateTableDataApi } from "@@/apis/tables"
import { usePagination } from "@@/composables/usePagination"
import { CirclePlus, Delete, Download, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { cloneDeep } from "lodash-es"

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

// #region 增
const DEFAULT_FORM_DATA: CreateOrUpdateTableRequestData = {
  id: undefined,
  username: "",
  password: ""
}
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = ref<CreateOrUpdateTableRequestData>(cloneDeep(DEFAULT_FORM_DATA))

// #region 改
// function handleUpdate(row: TableData) {
//   dialogVisible.value = true
//   formData.value = cloneDeep(row)
// }
// #endregion

// #region 查
const tableData = ref<TableData[]>([])
const sensorData = ref<SensorData[]>([])
// const searchFormRef = ref<FormInstance | null>(null)
// const searchData = reactive({
//   username: "",
//   phone: ""
// })

function parseSensorData(jsonString: string): SensorData[] {
  jsonString = "{\"soil_moisture\": 155, \"soil_temperature\": 0, \"electrical_conductivity\": 30, \"ph_value\": 0, \"CT_coefficient\": 55, \"salinity\": 0, \"TDS_coefficient\": 50, \"temperature_calibration\": 0, \"moisture_calibration\": 0, \"electrical_calibration\": 0, \"ph_calibration\": 0}"
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

  // 将对象转换为 SensorData 数组
  const parsedData: SensorData[] = Object.entries(jsonObject).map(([key, value]) => {
    // 显式断言 value 的类型为 number
    if (typeof value === "number") {
      return {
        sensor: key, // 将 key 映射到 sensor
        val: value // 将 value 映射到 val
      }
    } else {
      // 如果 value 不是 number 类型，记录警告并返回默认值
      console.warn(`Value for key "${key}" is not a number: ${value}`)
      return {
        sensor: key,
        val: 0 // 默认值
      }
    }
  })

  return parsedData
}
function getSensorData() {
  loading.value = true
  console.log("12345")
  getSensorDataApi({
    device_id: "2c7c6797442f9f25",
    datatype: "sensordata"
  }).then(({ data }) => {
    console.log("then")
    console.log(data.json)
    const parsedData = parseSensorData(data.json)
    paginationData.total = parsedData.length
    sensorData.value = parsedData
    console.log(parsedData)
  }).catch(() => {
    console.log("catch")
    sensorData.value = []
  }).finally(() => {
    console.log("finally")
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
</script>

<template>
  <div pa-20px h-full text-center flex select-none all:transition-400>
    <div ma>
      <div text-5xl fw100 animate-bounce-alt animate-count-infinite animate-duration-1s>
        Sensor Node
      </div>
    </div>
  </div>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never">
      <div class="table-wrapper">
        <el-table :data="sensorData">
          <el-table-column prop="sensor" label="sensor" align="center" />
          <el-table-column prop="val" label="val" align="center" />
        </el-table>
      </div>
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
