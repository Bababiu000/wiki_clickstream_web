import http from '@/utils/http'

export const getDateRangeAPI = () => {
  return http.get(`clickstream/date-range`)
}

export const getListAPI = (dateStr, pageNum, pageSize) => {
  return http.get(`clickstream/list/${dateStr}`, { params: { pageNum, pageSize } })
}

export const getCenterAPI = dateStr => {
  return http.get(`clickstream/center/${dateStr}`)
}

export const getDetailAPI = (dateStr, center) => {
  return http.get(`clickstream/detail/${dateStr}`, { params: { center } })
}
