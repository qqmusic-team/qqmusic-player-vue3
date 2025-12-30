import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'


import App from './App.vue'
import router from './router'
import "@/utils/extend"


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 【全局捕获未处理异常】
window.addEventListener('error', (event) => {
  console.error('全局 error 事件捕获:', event.error)
  alert('代码崩溃了！请打开控制台查看详情：\n' + event.message)
})

// 【全局捕获未处理的 Promise 拒绝】
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason)
  alert('异步代码崩溃了！请打开控制台查看：\n' + (event.reason?.message || event.reason))
})

// 【Vue 特定的错误捕获（推荐一起加）】
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue errorHandler 捕获:', err, info)
  alert('Vue 组件内错误！\n' + (err instanceof Error ? err.message : String(err)) + '\n位置：' + info)
}
app.mount('#app')
