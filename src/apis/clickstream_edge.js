import http from '@/utils/http'

export const getCenterEdgesAPI = dateStr => {
  return http.get(`clickstream_edge/center/${dateStr}`)
}

export const getClusterEdgesAPI = (dateStr, center) => {
  return http.get(`clickstream_edge/cluster/${dateStr}`, { params: { center } })
}
