import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/views/Layout/index.vue'
import Home from '@/views/Home/index.vue'
import WordCloud from '@/views/WordCloud/index.vue'
import Graph from '@/views/Graph/index.vue'
import NotFound from '@/views/NotFound/index.vue'

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
  },
  {
    path: '/:path(.*)',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
