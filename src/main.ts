import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'element-plus/dist/index.css'
import './style.css'

import App from './App.vue'
import router from '@/router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { blurFixPlugin } from './directives/index'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.use(blurFixPlugin)

app.mount('#app')
