import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/:catchAll(.*)',
      name: 'home',
      component: { template: '<div />' },
    },
  ],
})

export default router
