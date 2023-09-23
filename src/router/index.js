import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home/index.vue'

const routes = [
  {
    path: '/:date',
    name: 'Home',
    component: Home
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
