import type { App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router';
import Matrix from '../view/matrix.vue'

const routes = [
    {
        path: '/',
        redirect: '/matrix'
    },
    {
      path: '/matrix',
      name: 'matrix',
      component: Matrix
    }
]


export const router = createRouter({
    history: createWebHashHistory(),
    routes: routes,
    scrollBehavior() {
      return { left: 0, top: 0 }
    },
})

// config router
export function setupRouter(app: App<Element>) {
    app.use(router)
  }
  