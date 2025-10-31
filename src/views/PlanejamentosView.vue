<template>
  <div class="page-container">
    <!-- Banner -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1><i class="bi bi-calendar-check"></i> Planejamentos de Gastos</h1>
        <p>Organize seus gastos planejados e acompanhe o progresso de cada item</p>
      </div>
    </div>

    <!-- Cards de Estatísticas -->
    <div class="stats-grid">
      <div class="stat-card total">
        <div class="stat-icon">
          <i class="bi bi-list-check"></i>
        </div>
        <div class="stat-info">
          <h3>Total Planejado</h3>
          <p class="stat-value">{{ stats.totalPlanejamentos }}</p>
        </div>
      </div>

      <div class="stat-card pendentes">
        <div class="stat-icon">
          <i class="bi bi-hourglass-split"></i>
        </div>
        <div class="stat-info">
          <h3>Pendentes</h3>
          <p class="stat-value">{{ stats.pendentes }}</p>
        </div>
      </div>

      <div class="stat-card concluidos">
        <div class="stat-icon">
          <i class="bi bi-check-circle"></i>
        </div>
        <div class="stat-info">
          <h3>Concluídos</h3>
          <p class="stat-value">{{ stats.concluidos }}</p>
        </div>
      </div>

      <div class="stat-card valor-total">
        <div class="stat-icon">
          <i class="bi bi-cash-stack"></i>
        </div>
        <div class="stat-info">
          <h3>Valor Total</h3>
          <p class="stat-value">R$ {{ formatMoney(stats.valorTotal) }}</p>
        </div>
      </div>
    </div>

    <!-- Botão Novo Planejamento -->
    <div class="header-section">
      <button @click="openModal" class="btn-novo">
        <i class="bi bi-plus-circle"></i> Novo Planejamento
      </button>
      <div class="filter-controls">
        <select v-model="statusFilter" @change="filterPlanejamentos">
          <option value="">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="concluido">Concluído</option>
        </select>
      </div>
    </div>

    <!-- Tabela de Planejamentos -->
    <div class="table-section">
      <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Valor Planejado</th>
            <th>Valor Pago</th>
            <th>Status</th>
            <th class="text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="planejamento in planejamentosFiltrados" :key="planejamento.id">
            <td><strong>{{ planejamento.descricao }}</strong></td>
            <td>R$ {{ formatMoney(planejamento.valor_planejado) }}</td>
            <td>R$ {{ formatMoney(planejamento.valor_pago) }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(planejamento.status_gasto)]">
                {{ planejamento.status_display || 'Pendente' }}
              </span>
            </td>
            <td class="text-center">
              <div class="actions">
                <button @click="viewPlanejamento(planejamento)" class="btn-action view" title="Visualizar">
                  <i class="bi bi-eye"></i>
                </button>
                <button @click="editPlanejamento(planejamento)" class="btn-action edit" title="Editar">
                  <i class="bi bi-pencil"></i>
                </button>
                <button 
                  v-if="planejamento.status_gasto !== 'concluido'"
                  @click="concluirPlanejamento(planejamento)" 
                  class="btn-action concluir" 
                  title="Marcar como Concluído">
                  <i class="bi bi-check-circle"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="planejamentosFiltrados.length === 0">
            <td colspan="5" class="text-center empty-state">
              <i class="bi bi-inbox"></i>
              <p>Nenhum planejamento encontrado</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Criação/Edição -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingPlanejamento ? 'Editar Planejamento' : 'Novo Planejamento' }}</h3>
          <button @click="closeModal" class="btn-close-modal">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Descrição *</label>
            <input v-model="form.descricao" type="text" placeholder="Descrição do gasto planejado" />
          </div>
          <div class="form-group">
            <label>Valor Planejado *</label>
            <input v-model="form.valor_planejado" type="number" step="0.01" placeholder="0.00" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-cancel">Cancelar</button>
          <button @click="savePlanejamento" class="btn-save" :disabled="saving">
            <i v-if="saving" class="bi bi-arrow-repeat"></i>
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Visualização -->
    <div v-if="showViewModal" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Detalhes do Planejamento</h3>
          <button @click="closeViewModal" class="btn-close-modal">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="view-details">
            <div class="detail-item">
              <label>Descrição:</label>
              <p>{{ viewingPlanejamento?.descricao }}</p>
            </div>
            <div class="detail-item">
              <label>Valor Planejado:</label>
              <p><strong>R$ {{ formatMoney(viewingPlanejamento?.valor_planejado) }}</strong></p>
            </div>
            <div class="detail-item">
              <label>Valor Pago:</label>
              <p>R$ {{ formatMoney(viewingPlanejamento?.valor_pago) }}</p>
            </div>
            <div class="detail-item">
              <label>Valor Restante:</label>
              <p>R$ {{ formatMoney(viewingPlanejamento?.valor_restante) }}</p>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <p>
                <span :class="['status-badge', getStatusClass(viewingPlanejamento?.status_gasto)]">
                  {{ viewingPlanejamento?.status_display || 'Pendente' }}
                </span>
              </p>
            </div>
            <div v-if="viewingPlanejamento?.data_conclusao" class="detail-item">
              <label>Data de Conclusão:</label>
              <p>{{ formatDate(viewingPlanejamento.data_conclusao) }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button v-if="viewingPlanejamento?.status_gasto !== 'concluido'" @click="editFromViewModal" class="btn-edit">
            <i class="bi bi-pencil"></i> Editar
          </button>
          <button @click="closeViewModal" class="btn-cancel">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../services/api'

const planejamentos = ref([])
const showModal = ref(false)
const showViewModal = ref(false)
const editingPlanejamento = ref(null)
const viewingPlanejamento = ref(null)
const saving = ref(false)
const statusFilter = ref('')

const stats = reactive({
  totalPlanejamentos: 0,
  pendentes: 0,
  concluidos: 0,
  valorTotal: 0
})

const form = reactive({
  descricao: '',
  valor_planejado: ''
})

const planejamentosFiltrados = computed(() => {
  let filtered = planejamentos.value
  if (statusFilter.value) {
    filtered = filtered.filter(p => p.status_gasto === statusFilter.value)
  }
  return filtered
})

async function loadPlanejamentos() {
  try {
    const { data } = await api.get('/planejamentos/')
    planejamentos.value = Array.isArray(data) ? data : (data.results || [])
    updateStats()
  } catch (error) {
    console.error('Erro ao carregar planejamentos:', error)
    alert('Erro ao carregar planejamentos')
  }
}

function updateStats() {
  const lista = planejamentos.value || []
  stats.totalPlanejamentos = lista.length
  stats.pendentes = lista.filter(p => p.status_gasto === 'pendente').length
  stats.concluidos = lista.filter(p => p.status_gasto === 'concluido').length
  stats.valorTotal = lista.reduce((sum, p) => sum + (parseFloat(p.valor_planejado) || 0), 0)
}

function openModal() {
  editingPlanejamento.value = null
  form.descricao = ''
  form.valor_planejado = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingPlanejamento.value = null
  form.descricao = ''
  form.valor_planejado = ''
}

function editPlanejamento(planejamento) {
  editingPlanejamento.value = planejamento
  form.descricao = planejamento.descricao
  form.valor_planejado = planejamento.valor_planejado
  showModal.value = true
}

function viewPlanejamento(planejamento) {
  viewingPlanejamento.value = planejamento
  showViewModal.value = true
}

function closeViewModal() {
  showViewModal.value = false
  viewingPlanejamento.value = null
}

function editFromViewModal() {
  closeViewModal()
  setTimeout(() => {
    if (viewingPlanejamento.value) {
      editPlanejamento(viewingPlanejamento.value)
    }
  }, 300)
}

async function savePlanejamento() {
  if (!form.descricao || !form.valor_planejado) {
    alert('Preencha todos os campos obrigatórios')
    return
  }

  saving.value = true
  try {
    const payload = {
      descricao: form.descricao,
      valor_planejado: parseFloat(form.valor_planejado)
    }

    if (editingPlanejamento.value) {
      await api.put(`/planejamentos/${editingPlanejamento.value.id}/`, payload)
    } else {
      await api.post('/planejamentos/', payload)
    }

    await loadPlanejamentos()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar planejamento:', error)
    alert('Erro ao salvar planejamento: ' + (error.response?.data?.detail || error.message))
  } finally {
    saving.value = false
  }
}

async function concluirPlanejamento(planejamento) {
  if (!confirm(`Deseja marcar o planejamento "${planejamento.descricao}" como concluído? Isso criará uma saída no caixa.`)) {
    return
  }

  try {
    await api.post(`/planejamentos/${planejamento.id}/concluir/`)
    await loadPlanejamentos()
    alert('Planejamento marcado como concluído! A saída foi registrada no caixa.')
  } catch (error) {
    console.error('Erro ao concluir planejamento:', error)
    alert('Erro ao concluir planejamento: ' + (error.response?.data?.error || error.message))
  }
}

function filterPlanejamentos() {
  // Filtro aplicado pelo computed
}

function getStatusClass(status) {
  return status === 'concluido' ? 'status-concluido' : 'status-pendente'
}

function formatMoney(value) {
  return parseFloat(value || 0).toFixed(2)
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleDateString('pt-BR')
}

onMounted(loadPlanejamentos)
</script>

<style scoped>
.page-container { padding: 0; }

/* Banner */
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
  display: flex;
  align-items: center;
  gap: 16px;
}
.welcome-content p {
  font-size: 1.125rem;
  margin: 0;
  opacity: 0.95;
}

/* Grid de Estatísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
.stat-card.total .stat-icon { background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%); color: #0c5460; }
.stat-card.pendentes .stat-icon { background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); color: #856404; }
.stat-card.concluidos .stat-icon { background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); color: #155724; }
.stat-card.valor-total .stat-icon { background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); color: #721c24; }
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

.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.btn-novo { padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
.btn-novo:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4); }

.filter-controls select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background: white; }

.table-section { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
thead { background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); }
th { padding: 16px 20px; text-align: left; font-weight: 600; color: #2c3e50; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.5px; }
td { padding: 16px 20px; border-bottom: 1px solid #e1e5e9; color: #4a5568; }
.text-center { text-align: center; }
tbody tr:hover { background: #f8f9fa; }

.status-badge { padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; }
.status-pendente { background: #fff3cd; color: #856404; }
.status-concluido { background: #d4edda; color: #155724; }

.actions { display: flex; gap: 8px; justify-content: center; }
.btn-action { padding: 8px 12px; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.btn-action.view { background: #e3f2fd; color: #1976d2; }
.btn-action.view:hover { background: #bbdefb; }
.btn-action.edit { background: #fff3e0; color: #f57c00; }
.btn-action.edit:hover { background: #ffe0b2; }
.btn-action.concluir { background: #e8f5e9; color: #388e3c; }
.btn-action.concluir:hover { background: #c8e6c9; }

.empty-state { padding: 60px 20px; color: #a0aec0; }
.empty-state i { font-size: 3rem; margin-bottom: 16px; display: block; }
.empty-state p { font-size: 1rem; font-weight: 500; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.modal-content { background: white; border-radius: 16px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal-header { padding: 24px; border-bottom: 2px solid #e1e5e9; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px 16px 0 0; }
.modal-header h3 { margin: 0; font-size: 1.5rem; }
.btn-close-modal { background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-close-modal:hover { background: rgba(255,255,255,0.3); }

.modal-body { padding: 24px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50; }
.form-group input { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 1rem; transition: all 0.2s; }
.form-group input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }

.modal-footer { padding: 24px; border-top: 2px solid #e1e5e9; display: flex; gap: 12px; justify-content: flex-end; }
.btn-cancel { padding: 10px 20px; background: #e1e5e9; color: #2c3e50; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.btn-cancel:hover { background: #cbd5e0; }
.btn-save { padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

.view-details { display: flex; flex-direction: column; gap: 20px; }
.detail-item label { font-weight: 600; color: #718096; font-size: 0.9rem; margin-bottom: 4px; display: block; }
.detail-item p { margin: 0; color: #2c3e50; font-size: 1rem; }

.btn-edit { padding: 10px 20px; background: #fff3e0; color: #f57c00; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
.btn-edit:hover { background: #ffe0b2; }

@media (max-width: 768px) {
  .header-section { flex-direction: column; gap: 16px; align-items: stretch; }
  .modal-content { width: 95%; }
}
</style>
