<template>
  <nav class="navbar">
    <router-link to="/" class="brand">
      <img src="/logo.png" alt="Logo" class="brand-logo" />
      <span class="brand-text">Sistema Dança</span>
    </router-link>
    <div class="nav-right">
      <span v-if="token" class="user-info">Bem-vindo</span>
      <router-link v-if="!token" to="/login" class="login-btn">
        <i class="bi bi-box-arrow-in-right"></i> Login
      </router-link>
      <button v-else @click="logout" class="logout-btn">
        <i class="bi bi-box-arrow-right"></i> Sair
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const token = computed(() => localStorage.getItem('access_token'))

function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_data')
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
  height: 72px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  z-index: 1000;
  border-bottom: none;
  backdrop-filter: blur(10px);
}
.brand {
  font-size: 1.25rem;
  font-weight: bold;
  color: #fff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}
.brand-logo { height: 48px; width: auto; display: block; }
.brand-text {
  font-size: 1.125rem;
}
.nav-right {
  display: flex;
  gap: 16px;
  align-items: center;
}
.user-info {
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
}
.login-btn, .logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 10px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}
.login-btn:hover, .logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  border-color: rgba(255, 255, 255, 0.5);
}
@media (max-width: 768px) {
  .navbar { padding: 0 12px; }
  .brand-text { display: none; }
  .brand-icon { font-size: 1.5rem; }
  .user-info { display: none; }
}
</style>

