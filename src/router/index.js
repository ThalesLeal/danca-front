import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import CategoriasView from '../views/CategoriasView.vue'
import EventosView from '../views/EventosView.vue'
import CamisasView from '../views/CamisasView.vue'
import LotesView from '../views/LotesView.vue'
import TipoEventosView from '../views/TipoEventosView.vue'
import InscricoesView from '../views/InscricoesView.vue'
import ProfissionaisView from '../views/ProfissionaisView.vue'
import PlanejamentosView from '../views/PlanejamentosView.vue'
import EntradasView from '../views/EntradasView.vue'
import SaidasView from '../views/SaidasView.vue'
import PagamentosView from '../views/PagamentosView.vue'
import ResumoCaixaView from '../views/ResumoCaixaView.vue'
import PerfilView from '../views/PerfilView.vue'
import MeusPedidosView from '../views/MeusPedidosView.vue'
import MeusEventosView from '../views/MeusEventosView.vue'
import CalendarioView from '../views/CalendarioView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: LoginView },
  // Rotas administrativas (apenas para superusers)
  { path: '/categorias', name: 'categorias', component: CategoriasView, meta: { requiresAuth: true, requiresSuperUser: true } },
  { path: '/eventos', name: 'eventos', component: EventosView, meta: { requiresAuth: true, requiresSuperUser: true } },
  { path: '/camisas', name: 'camisas', component: CamisasView, meta: { requiresAuth: true, requiresSuperUser: true } },
  { path: '/lotes', name: 'lotes', component: LotesView, meta: { requiresAuth: true, requiresSuperUser: true } },
  { path: '/tipo-eventos', name: 'tipo-eventos', component: TipoEventosView, meta: { requiresAuth: true, requiresSuperUser: true } },
  { path: '/inscricoes', name: 'inscricoes', component: InscricoesView, meta: { requiresAuth: true, requiresSuperUser: true } },
  { path: '/profissionais', name: 'profissionais', component: ProfissionaisView, meta: { requiresAuth: true, requiresSuperUser: true } },
  { path: '/planejamentos', name: 'planejamentos', component: PlanejamentosView, meta: { requiresAuth: true, requiresSuperUser: true } },
  { path: '/entradas', name: 'entradas', component: EntradasView, meta: { requiresAuth: true, requiresSuperUser: true } },
  { path: '/saidas', name: 'saidas', component: SaidasView, meta: { requiresAuth: true, requiresSuperUser: true } },
  { path: '/pagamentos', name: 'pagamentos', component: PagamentosView, meta: { requiresAuth: true, requiresSuperUser: true } },
  { path: '/resumo-caixa', name: 'resumo-caixa', component: ResumoCaixaView, meta: { requiresAuth: true, requiresSuperUser: true } },
  // Rotas para usuários normais
  { path: '/perfil', name: 'perfil', component: PerfilView, meta: { requiresAuth: true } },
  { path: '/meus-pedidos', name: 'meus-pedidos', component: MeusPedidosView, meta: { requiresAuth: true } },
  { path: '/meus-eventos', name: 'meus-eventos', component: MeusEventosView, meta: { requiresAuth: true } },
  { path: '/calendario', name: 'calendario', component: CalendarioView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Função para verificar se o usuário é superuser
function isSuperUser() {
  try {
    const userData = localStorage.getItem('user_data')
    if (userData) {
      const user = JSON.parse(userData)
      return user.is_superuser || user.is_staff
    }
  } catch (e) {
    console.error('Erro ao verificar usuário:', e)
  }
  return false
}

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  
  // Se não tem token e a rota requer autenticação, vai para login
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }
  
  // Se tem token e está tentando acessar login, redireciona para a página inicial apropriada
  if (to.path === '/login' && token) {
    const superUser = isSuperUser()
    next(superUser ? '/' : '/perfil')
    return
  }
  
  // Se está tentando acessar rota administrativa sem ser superuser
  if (to.meta.requiresSuperUser && token && !isSuperUser()) {
    next('/perfil') // Redireciona para o perfil
    return
  }
  
  // Se está na home e não é superuser, redireciona para perfil
  if (to.path === '/' && token && !isSuperUser()) {
    next('/perfil')
    return
  }
  
  next()
})

export default router

