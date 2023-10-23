import http from '@/utils/http'

export const getDateRangeAPI = () => {
  return http.get(`clickstream_node/date_range`)
}

export const getNodeListAPI = (dateStr, pageNum, pageSize, keyword) => {
  return http.get(`clickstream_node/list/${dateStr}`, { params: { pageNum, pageSize, keyword } })
}

export const getCenterNodesAPI = dateStr => {
  return http.get(`clickstream_node/center/${dateStr}`)
}

export const getClusterNodesAPI = (dateStr, center) => {
  return http.get(`clickstream_node/cluster/${dateStr}`, { params: { center } })
}
