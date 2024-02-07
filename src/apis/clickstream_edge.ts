import http from '@/utils/http'
import { AxiosResponse } from 'axios'

export const getCenterEdgesAPI = (lang: string, dateStr: string): Promise<AxiosResponse> => {
  return http.get(`clickstream_edge/center/${lang}/${dateStr}`)
}

export const getClusterEdgesAPI = (
  lang: string,
  dateStr: string,
  label: number
): Promise<AxiosResponse> => {
  return http.get(`clickstream_edge/cluster/${lang}/${dateStr}`, { params: { label } })
}
