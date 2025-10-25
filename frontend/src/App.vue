<script setup>
import { RouterView } from 'vue-router';
import GridIcon from './components/icons/GridIcon.vue';
import ListIcon from './components/icons/ListIcon.vue';
</script>

<template>
  <div class="app">
    <RouterView class="app-body" />
    <nav class="app-nav">
      <ul>
        <li>
          <RouterLink class="link" :to="{ name: 'list' }">
            <GridIcon />
            <span>Browse</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink class="link" :to="{ name: 'voting' }">
            <ListIcon />
            <span>Voting</span>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.app {
  height: 100%;
  min-height: 100vh;
}

.app-nav {
  bottom: 0;
  left: 0;
  position: fixed;
  width: 100%;
}

.app-nav .link {
  align-items: center;
  color: white;
  display: flex;
  gap: 4px;
  font-size: 14px;
  font-family: var(--mv-ff-sans-serif);
  font-weight: var(--mv-fw-bold);
  opacity: 0.6;
  text-decoration: none;
}

.app-nav .link.router-link-active {
  opacity: 1;
}

.app-nav ul {
  align-items: flex-start;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  color: white;
  display: flex;
  justify-content: space-around;
  list-style: none;
  margin: 0;
  padding: 16px 0 calc(env(safe-area-inset-bottom) + 16px);
}

.app-nav ul>li {
  margin: 0;
  padding: 0;
}

.app-nav svg {
  height: 18px;
  width: 18px;
}
</style>
