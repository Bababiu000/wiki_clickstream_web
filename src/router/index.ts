import { Router, createRouter, createWebHashHistory } from 'vue-router'
import App from '@/App.vue'
import Index from '@/views/Index/index.vue'
import Home from '@/views/Home/index.vue'
import WordCloud from '@/views/WordCloud/index.vue'
import Graph from '@/views/Graph/index.vue'
import NotFound from '@/views/NotFound/index.vue'

// const routes = [
//   {
//     path: '/',
//     name: 'Layout',
//     component: Layout,
//     children: [
//       {
//         path: ':date',
//         name: 'Home',
//         component: Home
//       }
//     ]
//   },
//   {
//     path: '/:date/word-cloud',
//     name: 'WordCloud',
//     component: WordCloud
//   },
//   {
//     path: '/:date/graph',
//     name: 'Graph',
//     component: Graph
//   },
//   {
//     path: '/:path(.*)',
//     name: 'NotFound',
//     component: NotFound
//   }
// ]

const routes = [
  {
    path: '/',
    name: 'Index1',
    component: Index,
    children: [
      {
        path: ':lang',
        name: 'Index2',
        component: Index,
        children: [
          {
            path: ':date',
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
