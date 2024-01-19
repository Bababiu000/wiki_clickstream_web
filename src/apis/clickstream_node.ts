import http from '@/utils/http'
import { AxiosResponse } from 'axios'

export const getDateRangeAPI = (lang: string): Promise<AxiosResponse> => {
  return http.get(`clickstream_node/date_range/${lang}`)
}

export const getNodeListAPI = (
  lang: string,
  dateStr: string,
  pageNum: number,
  pageSize: number,
  keyword: string | undefined = ''
): Promise<AxiosResponse> => {
  return http.get(`clickstream_node/list/${lang}/${dateStr}`, {
    params: { pageNum, pageSize, keyword }
  })
}

export const getCenterNodesAPI = (lang: string, dateStr: string): Promise<AxiosResponse> => {
  return http.get(`clickstream_node/center/${lang}/${dateStr}`)
}

export const getClusterNodesAPI = (
  lang: string,
  dateStr: string,
  center: number
): Promise<AxiosResponse> => {
  return http.get(`clickstream_node/cluster/${lang}/${dateStr}`, { params: { center } })
}
