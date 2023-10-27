import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'list',
      component: () => import('../views/GridView.vue'),
    },
    {
      path: '/standings',
      name: 'standings',
      component: () => import('../views/RankedView.vue'),
      props: {
        showRankings: true,
      },
    },
    {
      path: '/secret-admin/movies/add',
      name: 'movieAdd',
      component: () => import('../views/MovieAddView.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
});

export default router;
