<template>
  <div class="page-container">
    <!-- Banner -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1><i class="bi bi-cart"></i> Gestão de Pedidos</h1>
        <p>Gerencie todos os pedidos de camisas de forma organizada</p>
      </div>
    </div>

    <!-- Cards de Estatísticas -->
    <div class="stats-grid">
      <div class="stat-card total">
        <div class="stat-icon">
          <i class="bi bi-cart"></i>
        </div>
        <div class="stat-info">
          <h3>Total de Pedidos</h3>
          <p class="stat-value">{{ stats.totalPedidos }}</p>
        </div>
      </div>

      <div class="stat-card pendentes">
        <div class="stat-icon">
          <i class="bi bi-hourglass-split"></i>
        </div>
        <div class="stat-info">
          <h3>Pendentes</h3>
          <p class="stat-value">{{ stats.pedidosPendentes }}</p>
        </div>
      </div>

      <div class="stat-card pagos">
        <div class="stat-icon">
          <i class="bi bi-check-circle"></i>
        </div>
        <div class="stat-info">
          <h3>Pagos</h3>
          <p class="stat-value">{{ stats.pedidosPagos }}</p>
        </div>
      </div>

      <div class="stat-card entregues">
        <div class="stat-icon">
          <i class="bi bi-truck"></i>
        </div>
        <div class="stat-info">
          <h3>Entregues</h3>
          <p class="stat-value">{{ stats.pedidosEntregues }}</p>
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

    <!-- Modal Criar/Editar Pedido -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>{{ form.id ? 'Editar Pedido' : 'Novo Pedido' }}</h4>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAndClose">
            <div class="form-row">
              <div class="form-group">
                <label>Nome Completo *</label>
                <input v-model="form.nome_completo" placeholder="Nome completo" required />
              </div>
              <div class="form-group">
                <label>Cidade *</label>
                <input v-model="form.cidade" placeholder="Cidade" required />
              </div>
            </div>

            <div class="form-group">
              <label>Tipo Cliente *</label>
              <div class="radio-group">
                <label class="radio-label" v-for="(label, value) in tipoClienteOptions" :key="value">
                  <input type="radio" v-model="form.tipo_cliente" :value="value" />
                  <span>{{ label }}</span>
                </label>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Camisa *</label>
                <select v-model="form.camisa" @change="onCamisaChange" required>
                  <option value="">Selecione a camisa</option>
                  <option v-for="camisa in camisasDisponiveis" :key="camisa.id" :value="camisa.id">
                    {{ camisa.descricao }} - R$ {{ formatMoney(camisa.valor_venda) }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Tamanho *</label>
                <select v-model="form.tamanho" required>
                  <option value="">Selecione</option>
                  <option v-for="(label, value) in tamanhoOptions" :key="value" :value="value">
                    {{ label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Cor *</label>
                <select v-model="form.cor" required>
                  <option value="">Selecione</option>
                  <option v-for="(label, value) in corOptions" :key="value" :value="value">
                    {{ label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="form.status">
                <option v-for="(label, value) in statusOptions" :key="value" :value="value">
                  {{ label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Observações</label>
              <textarea v-model="form.observacoes" rows="3" placeholder="Observações adicionais (opcional)"></textarea>
            </div>

            <div v-if="form.camisa" class="form-group valor-info">
              <label>Valor do Pedido:</label>
              <p class="valor-display">R$ {{ formatMoney(valorPedido) }}</p>
            </div>

            <div class="modal-actions">
              <button type="submit" class="btn-save" :disabled="saving">
                <span v-if="saving">Salvando...</span>
                <span v-else>{{ form.id ? 'Atualizar' : 'Adicionar' }}</span>
              </button>
              <button type="button" @click="closeModal" class="btn-cancel" :disabled="saving">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Lista -->
    <div class="list-section">
      <div class="header-actions">
        <h3>Pedidos Cadastrados</h3>
        <button @click="createNew" class="btn-new">
          <i class="bi bi-plus-lg"></i> Novo Pedido
        </button>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nº</th>
              <th>Cliente</th>
              <th>Cidade</th>
              <th>Camisa</th>
              <th>Tamanho</th>
              <th>Cor</th>
              <th>Valor</th>
              <th>Status</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pedido in pedidos.results || pedidos" :key="pedido.id">
              <td><strong>#{{ pedido.id }}</strong></td>
              <td>{{ pedido.nome_completo }}</td>
              <td>{{ pedido.cidade }}</td>
              <td>{{ pedido.camisa_descricao || '-' }}</td>
              <td>{{ getTamanhoDisplay(pedido.tamanho) }}</td>
              <td>{{ getCorDisplay(pedido.cor) }}</td>
              <td>R$ {{ formatMoney(pedido.valor_venda) }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(pedido.status)]">
                  {{ getStatusDisplay(pedido.status) }}
                </span>
              </td>
              <td class="text-center">
                <button @click="edit(pedido)" class="btn-edit" title="Editar">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button @click="remove(pedido)" class="btn-delete" title="Excluir">
                  <i class="bi bi-trash3-fill"></i>
                </button>
              </td>
            </tr>
            <tr v-if="(!pedidos.results || pedidos.results.length === 0) && (!pedidos || pedidos.length === 0)">
              <td colspan="9" class="text-center empty-state">
                <i class="bi bi-inbox"></i>
                <p>Nenhum pedido encontrado</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import api from '../services/api'

const pedidos = reactive({})
const camisasDisponiveis = ref([])
const form = reactive({
  id: null,
  nome_completo: '',
  cidade: '',
  tipo_cliente: 'externo',
  camisa: '',
  tamanho: '',
  cor: '',
  status: 'pendente',
  observacoes: ''
})
const showModal = ref(false)
const saving = ref(false)

const stats = reactive({
  totalPedidos: 0,
  pedidosPendentes: 0,
  pedidosPagos: 0,
  pedidosEntregues: 0,
  valorTotal: 0
})

const tipoClienteOptions = {
  'inscricao': 'Congressista',
  'profissional': 'Profissional',
  'externo': 'Cliente Externo',
  'equipe': 'Equipe',
  'colaborador': 'Colaborador'
}

const tamanhoOptions = {
  'PP': 'Pequeno(PP)',
  'P': 'Pequeno(P)',
  'M': 'Médio(M)',
  'G': 'Grande(G)',
  'GG': 'Extra Grande(GG)',
  'XG': 'Extra Grande(XG)',
  'XXG': 'Extra Extra Grande(XXG)'
}

const corOptions = {
  'branco': 'Branco',
  'verde': 'Verde',
  'laranja': 'Laranja',
  'rosa': 'Rosa',
  'roxo': 'Roxo',
  'marrom': 'Marrom',
  'preto': 'Preto',
  'azul': 'Azul',
  'vermelho': 'Vermelho',
  'amarelo': 'Amarelo',
  'cinza': 'Cinza'
}

const statusOptions = {
  'pendente': 'Pendente',
  'pago': 'Pago',
  'entregue': 'Entregue',
  'cancelado': 'Cancelado'
}

const valorPedido = computed(() => {
  if (!form.camisa) return 0
  const camisa = camisasDisponiveis.value.find(c => c.id == form.camisa)
  return camisa ? parseFloat(camisa.valor_venda || 0) : 0
})

async function fetchPedidos(url = null) {
  const { data } = await api.get(url || '/pedidos/?ordering=-data_pedido')
  Object.assign(pedidos, data)
  updateStats()
}

function updateStats() {
  const pedidosList = pedidos.results || pedidos || []
  stats.totalPedidos = pedidosList.length
  stats.pedidosPendentes = pedidosList.filter(p => p.status === 'pendente').length
  stats.pedidosPagos = pedidosList.filter(p => p.status === 'pago').length
  stats.pedidosEntregues = pedidosList.filter(p => p.status === 'entregue').length
  stats.valorTotal = pedidosList.reduce((sum, p) => sum + (parseFloat(p.valor_venda) || 0), 0)
}

async function fetchCamisas() {
  const { data } = await api.get('/camisas/')
  camisasDisponiveis.value = Array.isArray(data) ? data : (data.results || [])
}

function onCamisaChange() {
  // Atualizar valor quando camisa mudar
}

function createNew() {
  Object.assign(form, {
    id: null,
    nome_completo: '',
    cidade: '',
    tipo_cliente: 'externo',
    camisa: '',
    tamanho: '',
    cor: '',
    status: 'pendente',
    observacoes: ''
  })
  showModal.value = true
}

function edit(p) {
  Object.assign(form, {
    id: p.id,
    nome_completo: p.nome_completo,
    cidade: p.cidade,
    tipo_cliente: p.tipo_cliente,
    camisa: p.camisa?.id || p.camisa,
    tamanho: p.tamanho,
    cor: p.cor,
    status: p.status,
    observacoes: p.observacoes || ''
  })
  showModal.value = true
}

function reset() {
  Object.assign(form, {
    id: null,
    nome_completo: '',
    cidade: '',
    tipo_cliente: 'externo',
    camisa: '',
    tamanho: '',
    cor: '',
    status: 'pendente',
    observacoes: ''
  })
}

function closeModal() {
  reset()
  showModal.value = false
}

async function save() {
  saving.value = true
  try {
    const payload = {
      nome_completo: form.nome_completo,
      cidade: form.cidade,
      tipo_cliente: form.tipo_cliente,
      camisa: parseInt(form.camisa),
      tamanho: form.tamanho,
      cor: form.cor,
      status: form.status,
      observacoes: form.observacoes || ''
    }

    if (form.id) {
      await api.put(`/pedidos/${form.id}/`, payload)
    } else {
      await api.post('/pedidos/', payload)
    }
    await fetchPedidos()
  } catch (error) {
    console.error('Erro ao salvar pedido:', error)
    alert('Erro ao salvar pedido: ' + (error.response?.data?.detail || error.message))
  } finally {
    saving.value = false
  }
}

async function saveAndClose() {
  await save()
  closeModal()
}

async function remove(p) {
  if (confirm(`Excluir pedido #${p.id} de "${p.nome_completo}"?`)) {
    await api.delete(`/pedidos/${p.id}/`)
    await fetchPedidos()
  }
}

function formatMoney(value) {
  return parseFloat(value || 0).toFixed(2)
}

function getTamanhoDisplay(tamanho) {
  return tamanhoOptions[tamanho] || tamanho
}

function getCorDisplay(cor) {
  return corOptions[cor] || cor
}

function getStatusDisplay(status) {
  return statusOptions[status] || status
}

function getStatusClass(status) {
  const classMap = {
    'pendente': 'status-pendente',
    'pago': 'status-pago',
    'entregue': 'status-entregue',
    'cancelado': 'status-cancelado'
  }
  return classMap[status] || ''
}

onMounted(async () => {
  await Promise.all([fetchPedidos(), fetchCamisas()])
})
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
.stat-card.total .stat-icon { background: linear-gradient(135deg, #e2e3f5 0%, #d1d3f9 100%); color: #4338ca; }
.stat-card.pendentes .stat-icon { background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); color: #856404; }
.stat-card.pagos .stat-icon { background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); color: #155724; }
.stat-card.entregues .stat-icon { background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%); color: #0c5460; }
.stat-card.valor-total .stat-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
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

.list-section { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
.header-actions { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-bottom: 2px solid #e1e5e9; }
.header-actions h3 { margin: 0; color: #2c3e50; font-size: 1.5rem; font-weight: 600; }
.btn-new { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
.btn-new:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5); }
.table-container { overflow-x: auto; }

table { width: 100%; border-collapse: collapse; }
thead { background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); }
th { padding: 16px 20px; text-align: left; font-weight: 600; color: #2c3e50; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.5px; }
td { padding: 16px 20px; border-bottom: 1px solid #e1e5e9; color: #4a5568; }
.text-center { text-align: center; }
tbody tr:hover { background: #f8f9fa; }

.status-badge { padding: 6px 16px; border-radius: 8px; font-size: 0.875rem; font-weight: 600; display: inline-block; }
.status-pendente { background: #fff3cd; color: #856404; }
.status-pago { background: #d4edda; color: #155724; }
.status-entregue { background: #d1ecf1; color: #0c5460; }
.status-cancelado { background: #f8d7da; color: #721c24; }

.btn-edit, .btn-delete { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; margin: 0 4px; transition: all 0.2s; }
.btn-edit { background: #fef5e7; color: #d68910; }
.btn-edit:hover { background: #fdebd0; }
.btn-delete { background: #fee; color: #c0392b; }
.btn-delete:hover { background: #fdd; }
.empty-state { padding: 60px 20px; color: #a0aec0; }
.empty-state i { font-size: 3rem; margin-bottom: 16px; display: block; }
.empty-state p { font-size: 1rem; font-weight: 500; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 40px 20px; }
.modal-content { background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 20px; max-width: 800px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 28px 32px; border-bottom: 2px solid #e1e5e9; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px 20px 0 0; }
.modal-header h4 { margin: 0; color: white; font-size: 1.5rem; font-weight: 600; }
.close-btn { background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); font-size: 1.5rem; color: #fff; cursor: pointer; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; transition: all 0.3s; }
.close-btn:hover { background: rgba(255,255,255,0.3); transform: rotate(90deg); }
.modal-body { padding: 32px; }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 12px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
label { font-weight: 600; color: #2c3e50; font-size: 0.9rem; }
input, select, textarea { padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
input:focus, select:focus, textarea:focus { outline: none; border-color: #667eea; }
textarea { resize: vertical; font-family: inherit; }
.radio-group { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px; }
.radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 10px 16px; border: 2px solid #e1e5e9; border-radius: 8px; transition: all 0.2s; background: white; }
.radio-label:hover { border-color: #667eea; background: #f8f9ff; }
.radio-label input[type="radio"] { margin: 0; cursor: pointer; }
.radio-label:has(input[type="radio"]:checked) { border-color: #667eea; background: #f0f4ff; }
.valor-info { background: #f8f9fa; padding: 16px; border-radius: 8px; margin-top: 8px; }
.valor-display { font-size: 1.5rem; font-weight: 700; color: #667eea; margin: 0; }
.modal-actions { display: flex; gap: 16px; margin-top: 20px; justify-content: flex-end; }
.modal-actions .btn-save { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 32px; font-size: 1rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(102,126,234,0.4); transition: all 0.3s; cursor: pointer; }
.modal-actions .btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.5); }
.modal-actions .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.modal-actions .btn-cancel { background: rgba(245,101,101,0.1); color: #f56565; border: 2px solid #f56565; padding: 14px 32px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.3s; }
.modal-actions .btn-cancel:hover { background: #f56565; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,101,101,0.4); }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
  .modal-content { width: 95%; }
}
</style>

