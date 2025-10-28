<template>
  <div class="page-container">
    <h2>Meus Eventos</h2>

    <div class="events-section">
      <div class="header-actions">
        <h3>Eventos Disponíveis</h3>
        <div class="filter-controls">
          <select v-model="statusFilter" @change="filterEvents">
            <option value="">Todos os eventos</option>
            <option value="confirmado">Confirmados</option>
            <option value="pendente">Pendentes</option>
            <option value="realizado">Realizados</option>
          </select>
        </div>
      </div>

      <div class="events-grid">
        <div v-for="evento in eventosFiltrados" :key="evento.id" class="event-card">
          <div class="event-header">
            <h4>{{ evento.descricao }}</h4>
            <span :class="['status-badge', getStatusClass(evento.status)]">
              {{ getStatusDisplay(evento.status) }}
            </span>
          </div>

          <div class="event-content">
            <p v-if="evento.tipo_descricao"><strong>Tipo:</strong> {{ evento.tipo_descricao }}</p>
            <p v-if="evento.data"><strong>Data:</strong> {{ formatDate(evento.data) }}</p>
            <p v-if="evento.quantidade_pessoas"><strong>Vagas:</strong> {{ evento.quantidade_pessoas }}</p>
            <p v-if="evento.valor_unitario"><strong>Valor:</strong> R$ {{ formatMoney(evento.valor_unitario) }}</p>
            <p v-if="evento.contador_inscricoes"><strong>Inscritos:</strong> {{ evento.contador_inscricoes }}</p>
          </div>

          <div class="event-actions">
            <button v-if="!isInscrito(evento.id)" @click="inscreverEvento(evento)" class="btn-inscrever">
              <i class="bi bi-person-plus"></i> Inscrever-se
            </button>
            <button v-else @click="cancelarInscricao(evento)" class="btn-cancelar">
              <i class="bi bi-x-circle"></i> Cancelar Inscrição
            </button>
            <button @click="verDetalhes(evento)" class="btn-detalhes">
              <i class="bi bi-eye"></i> Ver Detalhes
            </button>
          </div>
        </div>

        <div v-if="eventosFiltrados.length === 0" class="empty-state">
          <i class="bi bi-calendar-x"></i>
          <p>Nenhum evento encontrado</p>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes do Evento -->
    <div v-if="eventoSelecionado" class="modal-overlay" @click="fecharDetalhes">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>{{ eventoSelecionado.descricao }}</h4>
          <button @click="fecharDetalhes" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="event-details">
            <div class="detail-row">
              <strong>Tipo:</strong> {{ eventoSelecionado.tipo_descricao || 'Não informado' }}
            </div>
            <div class="detail-row">
              <strong>Data:</strong> {{ formatDate(eventoSelecionado.data) }}
            </div>
            <div class="detail-row">
              <strong>Vagas:</strong> {{ eventoSelecionado.quantidade_pessoas || 'Não informado' }}
            </div>
            <div class="detail-row">
              <strong>Valor:</strong> {{ eventoSelecionado.valor_unitario ? 'R$ ' + formatMoney(eventoSelecionado.valor_unitario) : 'Gratuito' }}
            </div>
            <div class="detail-row">
              <strong>Inscritos:</strong> {{ eventoSelecionado.contador_inscricoes || 0 }}
            </div>
            <div class="detail-row">
              <strong>Status:</strong> 
              <span :class="['status-badge', getStatusClass(eventoSelecionado.status)]">
                {{ getStatusDisplay(eventoSelecionado.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../services/api'

const eventos = ref([])
const inscricoes = ref([])
const statusFilter = ref('')
const eventoSelecionado = ref(null)

const eventosFiltrados = computed(() => {
  if (!statusFilter.value) return eventos.value
  return eventos.value.filter(evento => evento.status === statusFilter.value)
})

async function loadEventos() {
  try {
    const { data } = await api.get('/eventos/')
    eventos.value = data.results || data
  } catch (error) {
    console.error('Erro ao carregar eventos:', error)
  }
}

async function loadInscricoes() {
  try {
    const { data } = await api.get('/inscricoes/')
    inscricoes.value = data.results || data
  } catch (error) {
    console.error('Erro ao carregar inscrições:', error)
  }
}

function isInscrito(eventoId) {
  return inscricoes.value.some(inscricao => inscricao.evento === eventoId)
}

async function inscreverEvento(evento) {
  if (confirm(`Inscrever-se no evento "${evento.descricao}"?`)) {
    try {
      await api.post('/inscricoes/', {
        evento: evento.id,
        nome: 'Usuário', // Será preenchido com dados do usuário logado
        email: 'usuario@email.com' // Será preenchido com dados do usuário logado
      })
      await loadInscricoes()
      alert('Inscrição realizada com sucesso!')
    } catch (error) {
      alert('Erro ao realizar inscrição: ' + (error.response?.data?.detail || error.message))
    }
  }
}

async function cancelarInscricao(evento) {
  const inscricao = inscricoes.value.find(insc => insc.evento === evento.id)
  if (inscricao && confirm(`Cancelar inscrição no evento "${evento.descricao}"?`)) {
    try {
      await api.delete(`/inscricoes/${inscricao.id}/`)
      await loadInscricoes()
      alert('Inscrição cancelada com sucesso!')
    } catch (error) {
      alert('Erro ao cancelar inscrição: ' + (error.response?.data?.detail || error.message))
    }
  }
}

function verDetalhes(evento) {
  eventoSelecionado.value = evento
}

function fecharDetalhes() {
  eventoSelecionado.value = null
}

function filterEvents() {
  // O filtro é aplicado automaticamente pelo computed eventosFiltrados
}

function getStatusDisplay(status) {
  const statusMap = {
    'pendente': 'Pendente',
    'confirmado': 'Confirmado',
    'cancelado': 'Cancelado',
    'realizado': 'Realizado'
  }
  return statusMap[status] || status
}

function getStatusClass(status) {
  const classMap = {
    'pendente': 'status-pendente',
    'confirmado': 'status-confirmado',
    'cancelado': 'status-cancelado',
    'realizado': 'status-realizado'
  }
  return classMap[status] || ''
}

function formatMoney(value) {
  return parseFloat(value || 0).toFixed(2)
}

function formatDate(value) {
  if (!value) return 'Não informado'
  const date = new Date(value)
  return date.toLocaleDateString('pt-BR')
}

onMounted(async () => {
  await Promise.all([
    loadEventos(),
    loadInscricoes()
  ])
})
</script>

<style scoped>
.page-container { padding: 0; }
h2 { font-size: 1.75rem; color: #2c3e50; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 3px solid #667eea; }

.events-section { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
.header-actions { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-bottom: 2px solid #e1e5e9; }
.header-actions h3 { margin: 0; color: #2c3e50; font-size: 1.5rem; font-weight: 600; }
.filter-controls select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background: white; }

.events-grid { padding: 24px; display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
.event-card { background: #f8f9fa; border-radius: 12px; padding: 20px; border: 1px solid #e1e5e9; transition: all 0.3s; }
.event-card:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }

.event-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.event-header h4 { margin: 0; color: #2d3748; font-size: 1.1rem; }
.status-badge { padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; }
.status-pendente { background: #fff3cd; color: #856404; }
.status-confirmado { background: #d4edda; color: #155724; }
.status-cancelado { background: #f8d7da; color: #721c24; }
.status-realizado { background: #d1ecf1; color: #0c5460; }

.event-content p { margin: 8px 0; color: #4a5568; font-size: 0.9rem; }
.event-actions { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
.btn-inscrever, .btn-cancelar, .btn-detalhes { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
.btn-inscrever { background: #c6f6d5; color: #2f855a; }
.btn-inscrever:hover { background: #9ae6b4; }
.btn-cancelar { background: #fed7d7; color: #c53030; }
.btn-cancelar:hover { background: #feb2b2; }
.btn-detalhes { background: #e6fffa; color: #2c7a7b; }
.btn-detalhes:hover { background: #b2f5ea; }

.empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #a0aec0; }
.empty-state i { font-size: 3rem; margin-bottom: 16px; display: block; }
.empty-state p { font-size: 1rem; font-weight: 500; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 40px 20px; }
.modal-content { background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 20px; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 28px 32px; border-bottom: 2px solid #e1e5e9; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px 20px 0 0; }
.modal-header h4 { margin: 0; color: white; font-size: 1.5rem; font-weight: 600; }
.close-btn { background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); font-size: 1.5rem; color: #fff; cursor: pointer; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; transition: all 0.3s; }
.close-btn:hover { background: rgba(255,255,255,0.3); transform: rotate(90deg); }
.modal-body { padding: 32px; }
.event-details .detail-row { margin-bottom: 12px; color: #4a5568; }

@media (max-width: 768px) {
  .events-grid { grid-template-columns: 1fr; }
  .header-actions { flex-direction: column; gap: 16px; align-items: stretch; }
  .event-actions { flex-direction: column; }
}
</style>
