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
import Transition from '../view/transition.vue'
import InAnimation from '../view/in_animation.vue'
import Effect from '../view/effect.vue'
import Clip from '../view/clip.vue'
import WebAv from '../view/web_av.vue'
import WebAvFrame from '../view/web_av_frame.vue'
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
    },
    {
      path: '/transition',
      name: 'transition',
      component: Transition
    },
    {
      path: '/in_animation',
      name: 'in_animation',
      component: InAnimation
    },
    {
      path: '/web_av',
      name: 'WebAv',
      component: WebAv
    },
    {
      path: '/effect',
      name: 'effect',
      component: Effect
    },
    {
      path: '/clip',
      name: 'clip',
      component: Clip
    },
    {
      path: '/web_av_frame',
      name: 'webAvFrame',
      component: WebAvFrame
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
  