<script setup>
import { RouterView, useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import { computed } from 'vue'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
</script>

<template>
  <div class="app">
    <template v-if="!isLoginPage">
      <Navbar />
      <div class="layout">
        <Sidebar />
        <main class="main-content">
          <RouterView />
        </main>
      </div>
    </template>
    <template v-else>
      <RouterView />
    </template>
  </div>
</template>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.layout {
  display: flex;
  margin-top: 72px;
  min-height: calc(100vh - 72px);
}
.main-content {
  margin-left: 280px;
  margin-top: 0;
  flex: 1;
  padding: 32px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  min-height: calc(100vh - 72px);
}
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 16px;
  }
}
</style>
