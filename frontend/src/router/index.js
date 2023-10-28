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
  scrollBehavior() {
    window.scrollTo(0, 0);
    return { x: 0, y: 0 };
  },
});

export default router;
