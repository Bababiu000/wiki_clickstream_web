import { Router, createRouter, createWebHashHistory } from 'vue-router'
import Index from '@/views/Index/index.vue'
import Home from '@/views/Home/index.vue'
import WordCloud from '@/views/WordCloud/index.vue'
import Graph from '@/views/Graph/index.vue'
import HeatMap from '@/views/HeatMap/index.vue'
import NotFound from '@/views/NotFound/index.vue'

const routes = [
  {
    path: '/',
    name: 'Index1',
    component: Index,
    children: [
      {
        path: ':lang(en|zh)',
        name: 'Index2',
        component: Index,
        children: [
          {
            path: ':date(\\d{4}-\\d{1,2})',
            name: 'Index3',
            component: Index,
            children: [
              {
                path: '',
                name: 'Home',
                component: Home
              },
              {
                path: 'word-cloud',
                name: 'WordCloud',
                component: WordCloud
              },
              {
                path: 'graph',
                name: 'Graph',
                component: Graph
              }
            ]
          },
          {
            path: 'heat-map',
            name: 'HeatMap',
            component: HeatMap
          }
        ]
      }
    ]
  },
  {
    path: '/:path(.*)',
    name: 'NotFound',
    component: NotFound
  }
]

const router: Router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
