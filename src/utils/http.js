import axios from 'axios'
import { ElLoading } from 'element-plus'

const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000
})

let loadingInstance = null

http.interceptors.request.use(
  config => {
    loadingInstance = ElLoading.service({ fullscreen: true, text: '正在加载...' })
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
http.interceptors.response.use(
  response => {
    loadingInstance.close()
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)

export default http
