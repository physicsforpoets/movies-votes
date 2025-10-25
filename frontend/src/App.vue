<script setup>
import { RouterView } from 'vue-router';
import GridIcon from './components/icons/GridIcon.vue';
import ListIcon from './components/icons/ListIcon.vue';
import AppInitializer from './components/AppInitializer.vue';
</script>

<template>
  <AppInitializer>
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
  </AppInitializer>
</template>

<style scoped>
.app {
  height: 100%;
  min-height: 100dvh;
}

.app-nav {
  bottom: 0;
  left: 0;
  padding: 0 24px min(calc(env(safe-area-inset-bottom) + 24px), 24px);
  position: fixed;
  width: 100%;
  z-index: 800;
}

.app-nav .link {
  -webkit-tap-highlight-color: transparent;
  appearance: none;
  background: none;
  border: none;
  border-radius: 0;
  align-items: center;
  color: white;
  display: flex;
  gap: 4px;
  font-size: 14px;
  font-family: var(--mv-ff-sans-serif);
  font-weight: var(--mv-fw-bold);
  opacity: 0.6;
  padding: 0;
  text-decoration: none;
  transition: opacity 300ms ease-in-out;
}

.app-nav .link.router-link-active {
  opacity: 1;
}

.app-nav ul {
  align-items: flex-start;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  color: white;
  display: flex;
  justify-content: space-around;
  list-style: none;
  margin: 0;
  overflow: hidden;
  padding: 16px 0;
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
