import http from '@/utils/http'

export const getDataAPI = (dateStr, dc_idx) => {
  return http.get(`clickstream/${dateStr}`, { params: { dc_idx } })
}

export const getAllDateAPI = () => {
  return http.get(`clickstream/alldate`)
}
