<template>
  <div class="section-header movies-header">
    <h2>Movies</h2>
    <nav class="section-nav">
      <ul>
        <li>
          <RouterLink :to="{ name: 'movieAdd' }">Add</RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
a {
  color: inherit;
}
</style>