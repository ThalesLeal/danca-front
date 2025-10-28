import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// Limpar tokens inválidos ao carregar a aplicação
function clearInvalidTokens() {
  const token = localStorage.getItem('access_token')
  if (token) {
    try {
      // Verificar se o token é válido (formato JWT básico)
      const parts = token.split('.')
      if (parts.length !== 3) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        return
      }
      
      // Verificar se o token não expirou (decodificação básica)
      const payload = JSON.parse(atob(parts[1]))
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
      }
    } catch (e) {
      // Token inválido, limpar tudo
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
    }
  }
}

// Executar limpeza antes de criar a app
clearInvalidTokens()

createApp(App).use(router).mount('#app')
