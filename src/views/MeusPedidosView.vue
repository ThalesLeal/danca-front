<template>
  <div class="page-container">
    <h2>Meus Pedidos</h2>

    <!-- Modal Novo Pedido -->
    <div v-if="showNewOrderModal" class="modal-overlay" @click="closeNewOrderModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>Novo Pedido</h4>
          <button @click="closeNewOrderModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createOrder">
            <div class="form-group">
              <label>Tipo de Pedido</label>
              <select v-model="newOrder.tipo_pedido" required>
                <option value="">Selecione o tipo</option>
                <option value="inscricao">Inscrição em Evento</option>
                <option value="camisa">Compra de Camisa</option>
              </select>
            </div>

            <!-- Seleção de Evento (se for inscrição) -->
            <div v-if="newOrder.tipo_pedido === 'inscricao'" class="form-group">
              <label>Evento</label>
              <select v-model="newOrder.evento_id" required>
                <option value="">Selecione um evento</option>
                <option v-for="evento in eventosDisponiveis" :key="evento.id" :value="evento.id">
                  {{ evento.descricao }} - {{ formatDate(evento.data) }}
                </option>
              </select>
            </div>

            <!-- Seleção de Camisa (se for compra de camisa) -->
            <div v-if="newOrder.tipo_pedido === 'camisa'" class="form-group">
              <label>Camisa</label>
              <select v-model="newOrder.camisa_id" required>
                <option value="">Selecione uma camisa</option>
                <option v-for="camisa in camisasDisponiveis" :key="camisa.id" :value="camisa.id">
                  {{ getTipoCamisa(camisa.tipo) }} - {{ camisa.descricao }} - R$ {{ formatMoney(camisa.valor_venda) }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Quantidade</label>
              <input v-model.number="newOrder.quantidade" type="number" min="1" placeholder="Quantidade" required />
            </div>

            <div class="form-group">
              <label>Observações</label>
              <textarea v-model="newOrder.observacoes" placeholder="Observações adicionais (opcional)" rows="3"></textarea>
            </div>

            <div class="modal-actions">
              <button type="submit" class="btn-save" :disabled="creating">
                <span v-if="creating">
                  <i class="bi bi-hourglass-split"></i> Criando...
                </span>
                <span v-else>
                  <i class="bi bi-plus-circle"></i> Criar Pedido
                </span>
              </button>
              <button type="button" @click="closeNewOrderModal" class="btn-cancel">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Lista de Pedidos -->
    <div class="orders-section">
      <div class="header-actions">
        <h3>Meus Pedidos</h3>
        <button @click="openNewOrderModal" class="btn-new">
          <i class="bi bi-plus-lg"></i> Novo Pedido
        </button>
      </div>

      <div class="orders-grid">
        <div v-for="pedido in pedidos" :key="pedido.id" class="order-card">
          <div class="order-header">
            <h4>Pedido #{{ pedido.id }}</h4>
            <span :class="['status-badge', getStatusClass(pedido.status)]">
              {{ getStatusDisplay(pedido.status) }}
            </span>
          </div>
          
          <div class="order-content">
            <p v-if="pedido.camisa_descricao"><strong>Camisa:</strong> {{ pedido.camisa_descricao }}</p>
            <p v-if="pedido.cor"><strong>Cor:</strong> {{ pedido.cor }}</p>
            <p v-if="pedido.tamanho"><strong>Tamanho:</strong> {{ pedido.tamanho }}</p>
            <p><strong>Valor:</strong> R$ {{ formatMoney(pedido.valor_venda) }}</p>
            <p v-if="pedido.observacoes"><strong>Observações:</strong> {{ pedido.observacoes }}</p>
            <p><strong>Data:</strong> {{ formatDate(pedido.data_pedido) }}</p>
          </div>

          <div class="order-actions">
            <button v-if="pedido.status === 'pendente'" @click="cancelOrder(pedido)" class="btn-cancel-order">
              <i class="bi bi-x-circle"></i> Cancelar
            </button>
            <button v-if="pedido.status === 'pendente'" @click="payOrder(pedido)" class="btn-pay">
              <i class="bi bi-credit-card"></i> Pagar
            </button>
            <router-link v-if="pedido.status === 'pago'" :to="`/nota/pedido/${pedido.id}`" class="btn-nota">
              <i class="bi bi-file-earmark-text"></i> Visualizar Nota
            </router-link>
          </div>
        </div>

        <div v-if="pedidos.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>Nenhum pedido encontrado</p>
          <button @click="openNewOrderModal" class="btn-new">
            <i class="bi bi-plus-lg"></i> Fazer Primeiro Pedido
          </button>
        </div>
      </div>
    </div>

    <PaymentModal 
      :show="showPayment" 
      mode="pedido"
      :pedido="pedidoSelecionado" 
      @close="showPayment = false" 
      @success="onPaymentSuccess" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../services/api'
import PaymentModal from '../components/PaymentModal.vue'

const pedidos = ref([])
const eventosDisponiveis = ref([])
const camisasDisponiveis = ref([])
const showNewOrderModal = ref(false)
const creating = ref(false)
const showPayment = ref(false)
const pedidoSelecionado = ref(null)

const newOrder = reactive({
  tipo_pedido: '',
  evento_id: null,
  camisa_id: null,
  quantidade: 1,
  observacoes: ''
})

async function loadPedidos() {
  try {
    const { data } = await api.get('/pedidos/')
    pedidos.value = data.results || data
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error)
  }
}

async function loadEventosDisponiveis() {
  try {
    const { data } = await api.get('/eventos/?status=confirmado')
    eventosDisponiveis.value = data.results || data
  } catch (error) {
    console.error('Erro ao carregar eventos:', error)
  }
}

async function loadCamisasDisponiveis() {
  try {
    const { data } = await api.get('/camisas/')
    camisasDisponiveis.value = data.results || data
  } catch (error) {
    console.error('Erro ao carregar camisas:', error)
  }
}

function openNewOrderModal() {
  showNewOrderModal.value = true
}

function closeNewOrderModal() {
  showNewOrderModal.value = false
  Object.assign(newOrder, {
    tipo_pedido: '',
    evento_id: null,
    camisa_id: null,
    quantidade: 1,
    observacoes: ''
  })
}

async function createOrder() {
  creating.value = true
  try {
    let payload = {}
    if (newOrder.tipo_pedido === 'inscricao') {
      // TODO: implementar criação de inscrição por aqui se necessário
      payload = { /* endpoint próprio de inscrições já existe */ }
      throw new Error('Criação de inscrição via "Meus Pedidos" ainda não implementada.')
    } else if (newOrder.tipo_pedido === 'camisa') {
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
      payload = {
        nome_completo: userData.first_name || userData.username || 'Cliente',
        cidade: '',
        tipo_cliente: 'externo',
        camisa: newOrder.camisa_id,
        cor: 'preto',
        tamanho: 'M',
        observacoes: newOrder.observacoes || ''
      }
      await api.post('/pedidos/', payload)
    }
    await loadPedidos()
    closeNewOrderModal()
    alert('Pedido criado com sucesso!')
  } catch (error) {
    alert('Erro ao criar pedido: ' + (error.response?.data?.detail || error.message))
  } finally {
    creating.value = false
  }
}

async function cancelOrder(pedido) {
  if (confirm(`Cancelar pedido "${getTipoPedidoDisplay(pedido.tipo_pedido)}"?`)) {
    try {
      await api.patch(`/pedidos/${pedido.id}/`, { status: 'cancelado' })
      await loadPedidos()
      alert('Pedido cancelado com sucesso!')
    } catch (error) {
      alert('Erro ao cancelar pedido: ' + (error.response?.data?.detail || error.message))
    }
  }
}

function payOrder(pedido) {
  pedidoSelecionado.value = pedido
  showPayment.value = true
}

async function onPaymentSuccess(resultado) {
  await loadPedidos()
  showPayment.value = false
  // Se tem nota fiscal, adicionar ao pedido atualizado
  if (resultado?.nota_url) {
    const pedidoAtualizado = pedidos.value.find(p => p.id === pedidoSelecionado.value?.id)
    if (pedidoAtualizado) {
      pedidoAtualizado.nota_url = resultado.nota_url
    }
  }
}

function downloadNota(pedido) {
  if (pedido.nota_url) {
    window.open(pedido.nota_url, '_blank')
  } else {
    alert('Nota fiscal ainda não está disponível')
  }
}

function getTipoPedidoDisplay(tipo) {
  const tipos = {
    'inscricao': 'Inscrição em Evento',
    'camisa': 'Compra de Camisa'
  }
  return tipos[tipo] || tipo
}

function getTipoCamisa(tipo) {
  const tipos = {
    'masculina': 'Masculina',
    'feminina': 'Feminina',
    'unissex': 'Unissex',
    'infantil': 'Infantil'
  }
  return tipos[tipo] || tipo
}

function getStatusDisplay(status) {
  const statusMap = {
    'pendente': 'Pendente',
    'pago': 'Pago',
    'cancelado': 'Cancelado',
    'processando': 'Processando'
  }
  return statusMap[status] || status
}

function getStatusClass(status) {
  const classMap = {
    'pendente': 'status-pendente',
    'pago': 'status-pago',
    'cancelado': 'status-cancelado',
    'processando': 'status-processando'
  }
  return classMap[status] || ''
}

function formatMoney(value) {
  return parseFloat(value || 0).toFixed(2)
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleDateString('pt-BR')
}

onMounted(async () => {
  await Promise.all([
    loadPedidos(),
    loadEventosDisponiveis(),
    loadCamisasDisponiveis()
  ])
})
</script>

<style scoped>
.page-container { padding: 0; }
h2 { font-size: 1.75rem; color: #2c3e50; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 3px solid #667eea; }

.orders-section { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
.header-actions { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-bottom: 2px solid #e1e5e9; }
.header-actions h3 { margin: 0; color: #2c3e50; font-size: 1.5rem; font-weight: 600; }
.btn-new { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
.btn-new:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5); }

.orders-grid { padding: 24px; display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
.order-card { background: #f8f9fa; border-radius: 12px; padding: 20px; border: 1px solid #e1e5e9; transition: all 0.3s; }
.order-card:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }

.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.order-header h4 { margin: 0; color: #2d3748; font-size: 1.1rem; }
.status-badge { padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; }
.status-pendente { background: #fff3cd; color: #856404; }
.status-pago { background: #d4edda; color: #155724; }
.status-cancelado { background: #f8d7da; color: #721c24; }
.status-processando { background: #d1ecf1; color: #0c5460; }

.order-content p { margin: 8px 0; color: #4a5568; font-size: 0.9rem; }
.order-actions { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
.btn-cancel-order, .btn-pay, .btn-nota { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
.btn-cancel-order { background: #fed7d7; color: #c53030; }
.btn-cancel-order:hover { background: #feb2b2; }
.btn-pay { background: #c6f6d5; color: #2f855a; }
.btn-pay:hover { background: #9ae6b4; }
.btn-nota { background: #e6fffa; color: #2c7a7b; }
.btn-nota:hover { background: #b2f5ea; }

.empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #a0aec0; }
.empty-state i { font-size: 3rem; margin-bottom: 16px; display: block; }
.empty-state p { font-size: 1rem; font-weight: 500; margin-bottom: 20px; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 40px 20px; }
.modal-content { background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 20px; max-width: 600px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 28px 32px; border-bottom: 2px solid #e1e5e9; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px 20px 0 0; }
.modal-header h4 { margin: 0; color: white; font-size: 1.5rem; font-weight: 600; }
.close-btn { background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); font-size: 1.5rem; color: #fff; cursor: pointer; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; transition: all 0.3s; }
.close-btn:hover { background: rgba(255,255,255,0.3); transform: rotate(90deg); }
.modal-body { padding: 32px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
label { font-weight: 600; color: #2d3748; font-size: 0.9rem; }
input, select, textarea { padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
input:focus, select:focus, textarea:focus { outline: none; border-color: #667eea; }
.modal-actions { display: flex; gap: 16px; margin-top: 20px; justify-content: flex-end; }
.modal-actions .btn-save { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 32px; font-size: 1rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(102,126,234,0.4); transition: all 0.3s; }
.modal-actions .btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.5); }
.modal-actions .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.modal-actions .btn-cancel { background: rgba(245,101,101,0.1); color: #f56565; border: 2px solid #f56565; padding: 14px 32px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.3s; }
.modal-actions .btn-cancel:hover { background: #f56565; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,101,101,0.4); }

@media (max-width: 768px) {
  .orders-grid { grid-template-columns: 1fr; }
  .modal-actions { flex-direction: column; }
}
</style>
