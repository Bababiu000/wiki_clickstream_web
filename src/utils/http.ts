import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse, AxiosInstance } from 'axios'
import { ElLoading, ElMessage } from 'element-plus'

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 30000
})

let loadingInstance: any = null

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    loadingInstance = ElLoading.service({ fullscreen: true, text: '正在加载...' })
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    loadingInstance.close()
    return response.data
  },
  (error: AxiosError) => {
    ElMessage.error(error)
    return Promise.reject(error)
  }
)

export default http
