<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="layout admin-layout">
    <header class="admin-header">
      <nav>
        <ul>
          <li><RouterLink to="/admin/lists">Lists</RouterLink></li>
          <li><RouterLink to="/admin/movies">Lists</RouterLink></li>
        </ul>
      </nav>
    </header>
    <slot />
  </div>
</template>
