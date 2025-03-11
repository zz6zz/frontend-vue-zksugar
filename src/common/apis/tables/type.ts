export interface CreateOrUpdateTableRequestData {
  id?: number
  username: string
  password?: string
}

export interface TableRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：用户名 */
  username?: string
  /** 查询参数：手机号 */
  phone?: string
}

export interface TableData {
  createTime: string
  email: string
  id: number
  phone: string
  roles: string
  status: boolean
  username: string
}

export type TableResponseData = ApiResponseData<{
  list: TableData[]
  total: number
}>

export interface SensorRequestData {
  /** 查询参数：device_id */
  device_id?: string
  /** 查询参数：configs or sensordata */
  datatype?: string
}

export interface SensorData {
  sensor: string
  val: number
}

export type SensorResponseData = ApiResponseData<{
  json: string
}>

export interface DeviceIdRequestData {
  /** 用作初始查询，不需要参数 */
}

export type DeviceIdResponseData = ApiResponseData<{
  json: string
}>

export interface DeviceIdData {
  deviceid: string
  val: number | string
}

export interface DeviceConfigRequestData {
  /** 查询参数：device_id */
  device_id?: string
}

export type DeviceConfigResponseData = ApiResponseData<{
  json: string
}>

export interface DeviceConfigData {
  json?: string
}

export interface DevicePropertySetRequestData {
  device_id?: string
}

export type DevicePropertySetResponseData = ApiResponseData<{
  json: string
}>

export interface DevicePropertySetData {
  json?: string
}

export interface DeviceUpdatePropertySetRequestData {
  device_id?: string
  json?: string
}
