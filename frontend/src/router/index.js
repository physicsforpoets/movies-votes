import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'list',
      component: () => import('../views/GridView.vue'),
    },
    {
      path: '/voting',
      name: 'voting',
      component: () => import('../views/VotingView.vue'),
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
