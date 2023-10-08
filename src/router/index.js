import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout/index.vue'
import Home from '@/views/Home/index.vue'
import WordCloud from '@/views/WordCloud/index.vue'
import Graph from '@/views/Graph/index.vue'

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    children: [
      {
        path: ':date',
        name: 'Home',
        component: Home
      }
    ]
  },
  {
    path: '/word-cloud/:date',
    name: 'WordCloud',
    component: WordCloud
  },
  {
    path: '/graph/:date',
    name: 'Graph',
    component: Graph
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
