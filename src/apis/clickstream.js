import http from '@/utils/http'

export const getDateRangeAPI = () => {
  return http.get(`clickstream/dateRange`)
}

export const getDCRootAPI = dateStr => {
  return http.get(`clickstream/dcRoot/${dateStr}`)
}

export const getDCsAPI = (dateStr, dcRoot) => {
  return http.get(`clickstream/dcs/${dateStr}`, { params: { dcRoot } })
}
