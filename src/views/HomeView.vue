<template>
  <div class="page-container">
    <!-- Banner de Boas-vindas -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1>Bem-vindo ao Sistema Dança</h1>
        <p>Gerencie seus eventos, categorias e pedidos de forma simples e eficiente</p>
      </div>
    </div>

    <!-- Cards de Estatísticas Rápidas -->
    <div class="stats-grid">
      <div class="stat-card events" @click="openEventosModal" style="cursor: pointer;">
        <div class="stat-icon">
          <i class="bi bi-calendar-event"></i>
        </div>
        <div class="stat-info">
          <h3>Eventos</h3>
          <p class="stat-value">{{ stats.totalEventos }}</p>
          <p class="stat-subtitle">Cadastrados</p>
        </div>
      </div>

      <div class="stat-card orders" @click="openPedidosModal" style="cursor: pointer;">
        <div class="stat-icon">
          <i class="bi bi-cart-check"></i>
        </div>
        <div class="stat-info">
          <h3>Pedidos</h3>
          <p class="stat-value">{{ stats.totalPedidos }}</p>
          <p class="stat-subtitle">{{ stats.pedidosPendentes }} pendentes</p>
        </div>
      </div>

      <div class="stat-card inscriptions" @click="openInscricoesModal" style="cursor: pointer;">
        <div class="stat-icon">
          <i class="bi bi-people"></i>
        </div>
        <div class="stat-info">
          <h3>Inscrições</h3>
          <p class="stat-value">{{ stats.totalInscricoes }}</p>
          <p class="stat-subtitle">Realizadas</p>
        </div>
      </div>
    </div>

    <!-- Seções de Conteúdo -->
    <div class="content-sections">
      <!-- Eventos Recentes -->
      <div class="content-card">
        <div class="card-header">
          <h3>
            <i class="bi bi-calendar-event"></i>
            Eventos Recentes
          </h3>
          <button @click="openEventosModal" class="btn-link">Ver todos <i class="bi bi-arrow-right"></i></button>
        </div>
        <div class="card-body">
          <div v-if="eventosRecentes.length > 0" class="list-items">
            <div v-for="evento in eventosRecentes" :key="evento.id" class="list-item">
              <div class="item-info">
                <strong>{{ evento.descricao }}</strong>
                <span class="item-date">{{ formatDate(evento.data) }}</span>
              </div>
              <span :class="['status-badge', getStatusClass(evento.status)]">
                {{ getStatusDisplay(evento.status) }}
              </span>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="bi bi-calendar-x"></i>
            <p>Nenhum evento cadastrado</p>
          </div>
        </div>
      </div>

      <!-- Pedidos Pendentes -->
      <div class="content-card">
        <div class="card-header">
          <h3>
            <i class="bi bi-hourglass-split"></i>
            Pedidos Pendentes
          </h3>
          <button @click="openPedidosModal" class="btn-link">Ver todos <i class="bi bi-arrow-right"></i></button>
        </div>
        <div class="card-body">
          <div v-if="pedidosPendentes.length > 0" class="list-items">
            <div v-for="pedido in pedidosPendentes" :key="pedido.id" class="list-item">
              <div class="item-info">
                <strong>Pedido #{{ pedido.id }}</strong>
                <span class="item-detail">{{ pedido.nome_completo || pedido.cliente_nome }}</span>
              </div>
              <span class="item-value">R$ {{ formatMoney(pedido.valor_pago || pedido.valor_venda) }}</span>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="bi bi-check-circle"></i>
            <p>Nenhum pedido pendente</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Acesso Rápido -->
    <div class="quick-access-section">
      <h3 class="section-title">Acesso Rápido</h3>
      <div class="quick-access-grid">
        <router-link to="/eventos" class="quick-access-card">
          <div class="quick-icon eventos">
            <i class="bi bi-calendar-event"></i>
          </div>
          <h4>Eventos</h4>
          <p>Gerencie seus eventos</p>
        </router-link>

        <router-link to="/inscricoes" class="quick-access-card">
          <div class="quick-icon inscricoes">
            <i class="bi bi-person-plus"></i>
          </div>
          <h4>Inscrições</h4>
          <p>Cadastre participantes</p>
        </router-link>

        <router-link to="/camisas" class="quick-access-card">
          <div class="quick-icon camisas">
            <i class="bi bi-tshirt"></i>
          </div>
          <h4>Camisas</h4>
          <p>Controle de estoque</p>
        </router-link>

        <router-link to="/resumo-caixa" class="quick-access-card">
          <div class="quick-icon caixa">
            <i class="bi bi-wallet2"></i>
          </div>
          <h4>Caixa</h4>
          <p>Resumo financeiro</p>
        </router-link>

        <router-link to="/pagamentos" class="quick-access-card">
          <div class="quick-icon pagamentos">
            <i class="bi bi-cash-coin"></i>
          </div>
          <h4>Pagamentos</h4>
          <p>Gerencie pagamentos</p>
        </router-link>

        <router-link to="/planejamentos" class="quick-access-card">
          <div class="quick-icon planejamentos">
            <i class="bi bi-calendar-check"></i>
          </div>
          <h4>Planejamentos</h4>
          <p>Gastos planejados</p>
        </router-link>
      </div>
    </div>

    <!-- Modal Eventos -->
    <div v-if="showEventosModal" class="modal-overlay" @click="closeEventosModal">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h4><i class="bi bi-calendar-event"></i> Todos os Eventos</h4>
          <button @click="closeEventosModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="todosEventos.length > 0" class="detail-list">
            <div v-for="evento in todosEventos" :key="evento.id" class="detail-item-full">
              <div class="detail-item-header">
                <strong>{{ evento.descricao }}</strong>
                <span :class="['status-badge', getStatusClass(evento.status)]">
                  {{ getStatusDisplay(evento.status) }}
                </span>
              </div>
              <div class="detail-item-body">
                <div class="detail-row">
                  <span class="detail-label">Data:</span>
                  <span class="detail-value">{{ formatDate(evento.data) }}</span>
                </div>
                <div v-if="evento.valor_unitario" class="detail-row">
                  <span class="detail-label">Valor:</span>
                  <span class="detail-value">R$ {{ formatMoney(evento.valor_unitario) }}</span>
                </div>
                <div v-if="evento.quantidade_pessoas" class="detail-row">
                  <span class="detail-label">Vagas:</span>
                  <span class="detail-value">{{ evento.quantidade_pessoas }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="bi bi-calendar-x"></i>
            <p>Nenhum evento cadastrado</p>
          </div>
        </div>
        <div class="modal-footer">
          <router-link to="/eventos" class="btn-link-full">Ir para página de Eventos</router-link>
          <button @click="closeEventosModal" class="btn-cancel">Fechar</button>
        </div>
      </div>
    </div>

    <!-- Modal Pedidos -->
    <div v-if="showPedidosModal" class="modal-overlay" @click="closePedidosModal">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h4><i class="bi bi-hourglass-split"></i> Todos os Pedidos</h4>
          <button @click="closePedidosModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="todosPedidos.length > 0" class="detail-list">
            <div v-for="pedido in todosPedidos" :key="pedido.id" class="detail-item-full">
              <div class="detail-item-header">
                <strong>Pedido #{{ pedido.id }}</strong>
                <span :class="['status-badge', getPedidoStatusClass(pedido.status || pedido.status_pagamento)]">
                  {{ getPedidoStatusDisplay(pedido.status || pedido.status_pagamento) }}
                </span>
              </div>
              <div class="detail-item-body">
                <div class="detail-row">
                  <span class="detail-label">Cliente:</span>
                  <span class="detail-value">{{ pedido.nome_completo || pedido.cliente_nome }}</span>
                </div>
                <div v-if="pedido.descricao_item" class="detail-row">
                  <span class="detail-label">Item:</span>
                  <span class="detail-value">{{ pedido.descricao_item }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Valor:</span>
                  <span class="detail-value">R$ {{ formatMoney(pedido.valor_pago || pedido.valor_venda) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="bi bi-check-circle"></i>
            <p>Nenhum pedido encontrado</p>
          </div>
        </div>
        <div class="modal-footer">
          <router-link to="/pedidos" class="btn-link-full">Ir para página de Pedidos</router-link>
          <button @click="closePedidosModal" class="btn-cancel">Fechar</button>
        </div>
      </div>
    </div>

    <!-- Modal Inscrições -->
    <div v-if="showInscricoesModal" class="modal-overlay" @click="closeInscricoesModal">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h4><i class="bi bi-people"></i> Todas as Inscrições</h4>
          <button @click="closeInscricoesModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="todasInscricoes.length > 0" class="detail-list">
            <div v-for="inscricao in todasInscricoes" :key="inscricao.id" class="detail-item-full">
              <div class="detail-item-header">
                <strong>{{ inscricao.nome }}</strong>
              </div>
              <div class="detail-item-body">
                <div v-if="inscricao.evento" class="detail-row">
                  <span class="detail-label">Evento:</span>
                  <span class="detail-value">{{ inscricao.evento }}</span>
                </div>
                <div v-if="inscricao.categoria_descricao" class="detail-row">
                  <span class="detail-label">Categoria:</span>
                  <span class="detail-value">{{ inscricao.categoria_descricao }}</span>
                </div>
                <div v-if="inscricao.municipio" class="detail-row">
                  <span class="detail-label">Município:</span>
                  <span class="detail-value">{{ inscricao.municipio }}{{ inscricao.uf ? ' - ' + inscricao.uf : '' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="bi bi-person-x"></i>
            <p>Nenhuma inscrição encontrada</p>
          </div>
        </div>
        <div class="modal-footer">
          <router-link to="/inscricoes" class="btn-link-full">Ir para página de Inscrições</router-link>
          <button @click="closeInscricoesModal" class="btn-cancel">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../services/api'

const eventosRecentes = ref([])
const pedidosPendentes = ref([])
const todosEventos = ref([])
const todosPedidos = ref([])
const todasInscricoes = ref([])

const showEventosModal = ref(false)
const showPedidosModal = ref(false)
const showInscricoesModal = ref(false)

const stats = reactive({
  totalEventos: 0,
  totalPedidos: 0,
  pedidosPendentes: 0,
  totalInscricoes: 0
})

async function loadStats() {
  try {
    // Carregar eventos
    const { data: eventosData } = await api.get('/eventos/?ordering=-data&page_size=5')
    eventosRecentes.value = eventosData.results || eventosData || []
    stats.totalEventos = eventosData.count || eventosRecentes.value.length

    // Carregar pedidos pendentes
    const { data: pagamentosData } = await api.get('/pagamentos/caixa/')
    pedidosPendentes.value = (pagamentosData || []).filter(p => p.status_pagamento === 'pendente').slice(0, 5)
    stats.pedidosPendentes = pedidosPendentes.value.length

    // Total de pedidos
    const { data: pedidosData } = await api.get('/pedidos/')
    const pedidos = pedidosData.results || pedidosData || []
    stats.totalPedidos = pedidos.length

    // Total de inscrições
    const { data: inscricoesData } = await api.get('/inscricoes/')
    const inscricoes = inscricoesData.results || inscricoesData || []
    stats.totalInscricoes = inscricoes.length
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error)
  }
}

function formatMoney(value) {
  return parseFloat(value || 0).toFixed(2)
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleDateString('pt-BR')
}

function getStatusDisplay(status) {
  const statusMap = {
    'pendente': 'Pendente',
    'aberto': 'Aberto',
    'encerrado': 'Encerrado',
    'cancelado': 'Cancelado'
  }
  return statusMap[status] || status
}

function getStatusClass(status) {
  const classMap = {
    'pendente': 'status-pendente',
    'aberto': 'status-aberto',
    'encerrado': 'status-encerrado',
    'cancelado': 'status-cancelado'
  }
  return classMap[status] || ''
}

async function openEventosModal() {
  showEventosModal.value = true
  if (todosEventos.value.length === 0) {
    await loadAllEventos()
  }
}

function closeEventosModal() {
  showEventosModal.value = false
}

async function loadAllEventos() {
  try {
    const { data } = await api.get('/eventos/?ordering=-data')
    todosEventos.value = data.results || data || []
  } catch (error) {
    console.error('Erro ao carregar eventos:', error)
  }
}

async function openPedidosModal() {
  showPedidosModal.value = true
  if (todosPedidos.value.length === 0) {
    await loadAllPedidos()
  }
}

function closePedidosModal() {
  showPedidosModal.value = false
}

async function loadAllPedidos() {
  try {
    const { data: pedidosData } = await api.get('/pedidos/')
    const pedidosList = pedidosData.results || pedidosData || []
    
    // Também carregar pagamentos pendentes
    const { data: pagamentosData } = await api.get('/pagamentos/caixa/')
    const pagamentosPendentes = (pagamentosData || []).filter(p => p.status_pagamento === 'pendente')
    
    // Combinar pedidos e pagamentos pendentes
    todosPedidos.value = [...pedidosList, ...pagamentosPendentes]
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error)
  }
}

async function openInscricoesModal() {
  showInscricoesModal.value = true
  if (todasInscricoes.value.length === 0) {
    await loadAllInscricoes()
  }
}

function closeInscricoesModal() {
  showInscricoesModal.value = false
}

async function loadAllInscricoes() {
  try {
    const { data } = await api.get('/inscricoes/')
    todasInscricoes.value = data.results || data || []
  } catch (error) {
    console.error('Erro ao carregar inscrições:', error)
  }
}

function getPedidoStatusDisplay(status) {
  const statusMap = {
    'pendente': 'Pendente',
    'pago': 'Pago',
    'entregue': 'Entregue',
    'cancelado': 'Cancelado'
  }
  return statusMap[status] || status
}

function getPedidoStatusClass(status) {
  const classMap = {
    'pendente': 'status-pendente',
    'pago': 'status-pago',
    'entregue': 'status-entregue',
    'cancelado': 'status-cancelado'
  }
  return classMap[status] || 'status-pendente'
}

onMounted(loadStats)
</script>

<style scoped>
.page-container { padding: 0; }

/* Banner de Boas-vindas */
.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 48px 40px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  color: white;
}
.welcome-content h1 {
  font-size: 2.5rem;
  margin: 0 0 12px 0;
  font-weight: 700;
}
.welcome-content p {
  font-size: 1.125rem;
  margin: 0;
  opacity: 0.95;
}

/* Grid de Estatísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}
.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.12);
}
.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}
.stat-card.events .stat-icon { background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%); color: #0c5460; }
.stat-card.orders .stat-icon { background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); color: #856404; }
.stat-card.inscriptions .stat-icon { background: linear-gradient(135deg, #e2e3f5 0%, #d1d3f9 100%); color: #4338ca; }
.stat-info h3 {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  color: #718096;
  font-weight: 600;
}
.stat-value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
}
.stat-subtitle {
  margin: 4px 0 0 0;
  font-size: 0.8rem;
  color: #a0aec0;
}

/* Seções de Conteúdo */
.content-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}
.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
}
.card-header {
  padding: 24px;
  border-bottom: 2px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}
.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}
.card-header h3 i {
  color: #667eea;
}
.btn-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}
.btn-link {
  background: none;
  border: none;
  cursor: pointer;
}
.btn-link:hover {
  color: #764ba2;
  gap: 10px;
}
.card-body {
  padding: 24px;
}
.list-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.2s;
}
.list-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}
.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.item-info strong {
  color: #2c3e50;
  font-size: 1rem;
}
.item-date, .item-detail {
  color: #718096;
  font-size: 0.875rem;
}
.item-value {
  color: #667eea;
  font-weight: 700;
  font-size: 1.1rem;
}
.status-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}
.status-pendente { background: #fff3cd; color: #856404; }
.status-aberto { background: #d4edda; color: #155724; }
.status-encerrado { background: #d1ecf1; color: #0c5460; }
.status-cancelado { background: #f8d7da; color: #721c24; }
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #a0aec0;
}
.empty-state i {
  font-size: 3rem;
  margin-bottom: 12px;
  display: block;
}
.empty-state p {
  margin: 0;
  font-size: 1rem;
}

/* Acesso Rápido */
.quick-access-section {
  margin-top: 32px;
}
.section-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 24px;
  font-weight: 600;
}
.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
.quick-access-card {
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.quick-access-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.quick-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 8px;
}
.quick-icon.eventos { background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%); color: #0c5460; }
.quick-icon.inscricoes { background: linear-gradient(135deg, #e2e3f5 0%, #d1d3f9 100%); color: #4338ca; }
.quick-icon.camisas { background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); color: #856404; }
.quick-icon.caixa { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.quick-icon.pagamentos { background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); color: #155724; }
.quick-icon.planejamentos { background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); color: #721c24; }
.quick-access-card h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 600;
}
.quick-access-card p {
  margin: 0;
  font-size: 0.875rem;
  color: #718096;
}

/* Modais */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 40px 20px;
}
.detail-modal {
  background: white;
  border-radius: 20px;
  max-width: 900px;
  width: 90%;
  max-height: 85vh;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
}
.modal-header {
  padding: 24px 32px;
  border-bottom: 2px solid #e1e5e9;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px 20px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}
.modal-header h4 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}
.close-btn {
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.3);
  font-size: 1.5rem;
  color: #fff;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s;
}
.close-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: rotate(90deg);
}
.modal-body {
  padding: 24px 32px;
  overflow-y: auto;
  flex: 1;
}
.detail-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.detail-item-full {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}
.detail-item-full:hover {
  background: #e9ecef;
  transform: translateX(4px);
}
.detail-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.detail-item-header strong {
  color: #2c3e50;
  font-size: 1.1rem;
}
.detail-item-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.detail-row {
  display: flex;
  gap: 12px;
}
.detail-label {
  font-weight: 600;
  color: #718096;
  min-width: 100px;
}
.detail-value {
  color: #2c3e50;
}
.modal-footer {
  padding: 24px 32px;
  border-top: 2px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn-link-full {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-link-full:hover {
  color: #764ba2;
}
.btn-cancel {
  background: rgba(245,101,101,0.1);
  color: #f56565;
  border: 2px solid #f56565;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-cancel:hover {
  background: #f56565;
  color: white;
}
.status-pago { background: #d4edda; color: #155724; }
.status-entregue { background: #d1ecf1; color: #0c5460; }

@media (max-width: 768px) {
  .welcome-content h1 { font-size: 2rem; }
  .stats-grid { grid-template-columns: 1fr; }
  .content-sections { grid-template-columns: 1fr; }
  .quick-access-grid { grid-template-columns: repeat(2, 1fr); }
  .detail-modal { width: 95%; max-height: 90vh; }
  .modal-header, .modal-body, .modal-footer { padding: 20px; }
}
</style>
