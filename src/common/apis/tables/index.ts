import type * as Tables from "./type"
import { agsRequest, request } from "@/http/axios"

/** 增 */
export function createTableDataApi(data: Tables.CreateOrUpdateTableRequestData) {
  return request({
    url: "tables",
    method: "post",
    data
  })
}

/** 删 */
export function deleteTableDataApi(id: number) {
  return request({
    url: `tables/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateTableDataApi(data: Tables.CreateOrUpdateTableRequestData) {
  return request({
    url: "tables",
    method: "put",
    data
  })
}

/** 查 */
export function getTableDataApi(params: Tables.TableRequestData) {
  return request<Tables.TableResponseData>({
    url: "tables",
    method: "get",
    params
  })
}

/** 查: 所有设备的ID */
export function getDeviceIdDataApi(params: Tables.DeviceIdRequestData) {
  return agsRequest<Tables.DeviceIdResponseData>({
    url: "devices",
    method: "get",
    params
  })
}

/** 查: 传感器数据 */
export function getSensorDataApi(params: Tables.SensorRequestData) {
  return agsRequest<Tables.SensorResponseData>({
    url: "sensor",
    method: "get",
    params
  })
}

/** 查: Device当前属性 */
export function getDeviceConfigDataApi(params: Tables.DeviceConfigRequestData) {
  return agsRequest<Tables.DeviceConfigResponseData>({
    url: "property",
    method: "get",
    params
  })
}

/** 查: Device配置 */
export function getDevicePropertySetDataApi(params: Tables.DevicePropertySetRequestData) {
  return agsRequest<Tables.DevicePropertySetResponseData>({
    url: "property_set",
    method: "get",
    params
  })
}

/** 改 */
export function updateDevicePropertySetDataApi(data: Tables.DeviceUpdatePropertySetRequestData) {
  return agsRequest({
    url: "property_update",
    method: "post",
    data
  })
}

/** 查：Device配置模板 */
export function getDevicePropertySetTemplateDataApi(data: Tables.DeviceUpdatePropertySetRequestData) {
  return agsRequest({
    url: "property_template",
    method: "get",
    data
  })
}
