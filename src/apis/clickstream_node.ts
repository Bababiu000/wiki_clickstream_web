import http from '@/utils/http'
import { AxiosResponse } from 'axios'

export const getDateRangeAPI = (): Promise<AxiosResponse> => {
  return http.get(`clickstream_node/date_range`)
}

export const getNodeListAPI = (
  dateStr: string,
  pageNum: number,
  pageSize: number,
  keyword: string | undefined = ''
): Promise<AxiosResponse> => {
  return http.get(`clickstream_node/list/${dateStr}`, { params: { pageNum, pageSize, keyword } })
}

export const getCenterNodesAPI = (dateStr: string): Promise<AxiosResponse> => {
  return http.get(`clickstream_node/center/${dateStr}`)
}

export const getClusterNodesAPI = (dateStr: string, center: number): Promise<AxiosResponse> => {
  return http.get(`clickstream_node/cluster/${dateStr}`, { params: { center } })
}
