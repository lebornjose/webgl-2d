import type { App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router';
import Matrix from '../view/matrix.vue'
import Flip from '../view/flip.vue'
import Crop from '../view/crop.vue'
import Filter from '../view/filter.vue'
import Color from '../view/color.vue'
import Mask from '../view/Mask.vue'
import Hue from '../view/Hue.vue'
import CirMask from '../view/cir_mask.vue'
import FiveMask from '../view/five_mask.vue'

const routes = [
    {
        path: '/',
        redirect: '/matrix'
    },
    {
      path: '/matrix',
      name: 'matrix',
      component: Matrix
    },
    {
      path: '/flip',
      name: 'flip',
      component: Flip
    },
    {
      path: '/crop',
      name: 'crop',
      component: Crop
    },
    {
      path: '/filter',
      name: 'filter',
      component: Filter
    },
    {
      path: '/color',
      name: 'color',
      component: Color
    },
    {
      path: '/mask',
      name: 'mask',
      component: Mask
    },
    {
      path: '/hue',
      name: 'hue',
      component: Hue  
    },
    {
      path: '/cir_mask',
      name: 'cir_mask',
      component: CirMask
    },
    {
      path: '/five_mask',
      name: 'five_mask',
      component: FiveMask
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
  