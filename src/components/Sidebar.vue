<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <!-- Menu para Superusuários -->
      <ul v-if="isSuperUser" class="nav-menu">
        <!-- CADASTROS -->
        <li class="nav-item dropdown">
          <button class="nav-link" @click="toggleCollapse('cadastros')">
            <i class="bi bi-file-earmark-person"></i>
            <span>Cadastros</span>
            <i class="bi bi-chevron-down ms-auto"></i>
          </button>
          <ul v-if="openSection === 'cadastros'" class="submenu">
            <li><router-link to="/lotes"><i class="bi bi-box"></i><span>Lotes</span></router-link></li>
            <li><router-link to="/categorias"><i class="bi bi-tags"></i><span>Categorias</span></router-link></li>
            <li><router-link to="/tipo-eventos"><i class="bi bi-calendar-event"></i><span>Tipo de Evento</span></router-link></li>
            <li><router-link to="/camisas"><span class="camisa-icon">👕</span><span>Camisas</span></router-link></li>
          </ul>
        </li>

        <!-- INSCRIÇÃO -->
        <li class="nav-item dropdown">
          <button class="nav-link" @click="toggleCollapse('inscricao')">
            <i class="bi bi-person-plus"></i>
            <span>Inscrição</span>
            <i class="bi bi-chevron-down ms-auto"></i>
          </button>
          <ul v-if="openSection === 'inscricao'" class="submenu">
            <li><router-link to="/profissionais"><i class="bi bi-mic"></i><span>Profissionais</span></router-link></li>
            <li><router-link to="/inscricoes"><i class="bi bi-people"></i><span>Inscrições</span></router-link></li>
          </ul>
        </li>

        <!-- PLANEJAMENTOS -->
        <li><router-link to="/planejamentos" class="nav-link"><i class="bi bi-calendar-check"></i><span>Planejamentos</span></router-link></li>

        <!-- PEDIDOS -->
        <li><router-link to="/pagamentos" class="nav-link"><i class="bi bi-cart"></i><span>Pedidos</span></router-link></li>

        <!-- EVENTOS -->
        <li><router-link to="/eventos" class="nav-link"><i class="bi bi-calendar-event"></i><span>Eventos</span></router-link></li>

        <!-- CAIXA -->
        <li class="nav-item dropdown">
          <button class="nav-link" @click="toggleCollapse('caixa')">
            <i class="bi bi-wallet2"></i>
            <span>Caixa</span>
            <i class="bi bi-chevron-down ms-auto"></i>
          </button>
          <ul v-if="openSection === 'caixa'" class="submenu">
            <li><router-link to="/resumo-caixa"><i class="bi bi-graph-up"></i><span>Resumo</span></router-link></li>
            <li><router-link to="/entradas"><i class="bi bi-arrow-up-circle"></i><span>Entradas</span></router-link></li>
            <li><router-link to="/saidas"><i class="bi bi-arrow-down-circle"></i><span>Saídas</span></router-link></li>
          </ul>
        </li>

        <!-- PAGAMENTOS -->
        <li class="nav-item dropdown">
          <button class="nav-link" @click="toggleCollapse('pagamentos')">
            <i class="bi bi-cash-coin"></i>
            <span>Pagamentos</span>
            <i class="bi bi-chevron-down ms-auto"></i>
          </button>
          <ul v-if="openSection === 'pagamentos'" class="submenu">
            <li><router-link to="/pagamentos"><i class="bi bi-receipt"></i><span>Lista de Pagamentos</span></router-link></li>
            <li><router-link to="/pagamentos/novo"><i class="bi bi-plus-circle"></i><span>Novo Pagamento</span></router-link></li>
          </ul>
        </li>
      </ul>

      <!-- Menu para Usuários Normais -->
      <ul v-else class="nav-menu">
        <li><router-link to="/perfil" class="nav-link"><i class="bi bi-person-circle"></i><span>Meu Perfil</span></router-link></li>
        <li><router-link to="/meus-pedidos" class="nav-link"><i class="bi bi-cart"></i><span>Meus Pedidos</span></router-link></li>
        <li><router-link to="/meus-eventos" class="nav-link"><i class="bi bi-calendar-event"></i><span>Meus Eventos</span></router-link></li>
        <li><router-link to="/calendario" class="nav-link"><i class="bi bi-calendar3"></i><span>Calendário</span></router-link></li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'

const openSection = ref('cadastros')

// Verificar se o usuário é superuser
const isSuperUser = computed(() => {
  try {
    const userData = localStorage.getItem('user_data')
    if (userData) {
      const user = JSON.parse(userData)
      return user.is_superuser || user.is_staff
    }
    return false
  } catch (e) {
    return false
  }
})

function toggleCollapse(section) {
  openSection.value = openSection.value === section ? null : section
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 72px;
  left: 0;
  bottom: 0;
  width: 280px;
  background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
  color: white;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 4px 0 20px rgba(0,0,0,0.3);
  border-right: none;
}
.sidebar-content {
  padding: 1rem 0.5rem;
  height: 100%;
}
.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}
.nav-item {
  margin-bottom: 0.25rem;
}
.nav-link {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  border: none;
  background: transparent;
  font-weight: 500;
  margin: 0 8px 6px 8px;
}
.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
  color: white;
}
.nav-link.router-link-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  color: white;
}
.nav-link i {
  font-size: 1.25rem;
  margin-right: 12px;
  min-width: 24px;
  opacity: 0.9;
}
.nav-link span {
  flex: 1;
  font-size: 0.95rem;
}
.submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  margin-left: 24px;
  margin-right: 8px;
}
.submenu li a {
  padding: 10px 16px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  color: rgba(255,255,255,0.8) !important;
  text-decoration: none;
  border-radius: 8px;
  margin: 2px 0;
  transition: all 0.2s ease;
}
.submenu li a:hover,
.submenu li a.router-link-active {
  background: rgba(102, 126, 234, 0.2);
  color: white !important;
  transform: translateX(4px);
}
.submenu li a i,
.submenu li a .camisa-icon {
  margin-right: 10px;
  font-size: 1rem;
  min-width: 20px;
  display: inline-block;
}
@media (max-width: 768px) {
  .sidebar { width: 70px; }
  .nav-link span { display: none; }
  .sidebar { transform: translateX(-100%); }
}
</style>

