import http from '@/utils/http'
import { AxiosResponse } from 'axios'

export const getCenterEdgesAPI = (dateStr: string): Promise<AxiosResponse> => {
  return http.get(`clickstream_edge/center/${dateStr}`)
}

export const getClusterEdgesAPI = (dateStr: string, center: number): Promise<AxiosResponse> => {
  return http.get(`clickstream_edge/cluster/${dateStr}`, { params: { center } })
}
