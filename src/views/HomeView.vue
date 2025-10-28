<template>
  <main class="container">
    <div class="welcome">
      <h1>Bem-vindo ao Sistema Dança</h1>
      <p>Gerencie seus eventos, categorias e camisas de forma simples e eficiente.</p>
    </div>

    <div class="dashboard">
      <div class="card">
        <h2>Eventos Recentes</h2>
        <ul v-if="eventos.results && eventos.results.length">
          <li v-for="ev in eventos.results.slice(0, 5)" :key="ev.id" class="event-item">
            <strong>{{ ev.descricao }}</strong>
            <span class="badge">{{ ev.status }}</span>
          </li>
        </ul>
        <p v-else class="empty">Nenhum evento cadastrado</p>
        <router-link to="/eventos" class="btn-link">Ver todos →</router-link>
      </div>

      <div class="card">
        <h2>Categorias</h2>
        <ul v-if="categorias.results && categorias.results.length">
          <li v-for="c in categorias.results" :key="c.id">{{ c.descricao }}</li>
        </ul>
        <p v-else class="empty">Nenhuma categoria cadastrada</p>
        <router-link to="/categorias" class="btn-link">Gerenciar →</router-link>
      </div>
    </div>

    <div class="quick-links">
      <router-link to="/eventos" class="quick-link">
        <div class="icon">📅</div>
        <h3>Eventos</h3>
        <p>Gerencie seus eventos</p>
      </router-link>
      <router-link to="/categorias" class="quick-link">
        <div class="icon">📂</div>
        <h3>Categorias</h3>
        <p>Organize por categoria</p>
      </router-link>
      <router-link to="/camisas" class="quick-link">
        <div class="icon">👕</div>
        <h3>Camisas</h3>
        <p>Controle de estoque</p>
      </router-link>
    </div>
  </main>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import api from '../services/api'

const eventos = reactive({})
const categorias = reactive({})

onMounted(async () => {
  try {
    const [evRes, catRes] = await Promise.all([
      api.get('/eventos/?ordering=-data&page_size=5'),
      api.get('/categorias/'),
    ])
    Object.assign(eventos, evRes.data)
    Object.assign(categorias, catRes.data)
  } catch (e) {
    console.error('Erro ao carregar dados:', e)
  }
})
</script>

<style scoped>
.container { max-width: 1200px; margin: 40px auto; padding: 20px; }
.welcome { text-align: center; margin-bottom: 48px; }
.welcome h1 { font-size: 2.5rem; color: #2c3e50; margin-bottom: 12px; }
.welcome p { font-size: 1.125rem; color: #7f8c8d; }
.dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 48px; }
.card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.card h2 { font-size: 1.5rem; margin-bottom: 16px; color: #2c3e50; border-bottom: 2px solid #42b883; padding-bottom: 8px; }
.card ul { list-style: none; padding: 0; margin: 0 0 16px 0; }
.card li { padding: 12px 0; border-bottom: 1px solid #ecf0f1; }
.event-item { display: flex; justify-content: space-between; align-items: center; }
.badge { background: #42b883; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; }
.empty { color: #95a5a6; font-style: italic; }
.btn-link { display: inline-block; margin-top: 8px; color: #42b883; text-decoration: none; font-weight: 600; }
.quick-links { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
.quick-link { background: white; padding: 32px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s; text-decoration: none; color: inherit; }
.quick-link:hover { transform: translateY(-4px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
.icon { font-size: 3rem; margin-bottom: 12px; }
.quick-link h3 { font-size: 1.25rem; color: #2c3e50; margin: 12px 0 8px 0; }
.quick-link p { color: #7f8c8d; font-size: 0.875rem; }
@media (max-width: 768px) {
  .welcome h1 { font-size: 2rem; }
  .dashboard { grid-template-columns: 1fr; }
}
</style>
