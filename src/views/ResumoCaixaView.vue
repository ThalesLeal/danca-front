<template>
  <div class="page-container">
    <h2>Resumo do Caixa</h2>

    <!-- Cards de Resumo Principal -->
    <div class="summary-cards-main">
      <div class="summary-card-large clickable" @click="openDetailModal('arrecadado')">
        <div class="card-header">
          <div class="card-icon-large revenue">
            <i class="bi bi-cash-coin"></i>
          </div>
          <div>
            <h3>Total Arrecadado</h3>
            <p class="subtitle">Soma de todas as entradas</p>
          </div>
        </div>
        <div class="card-amount-large">
          <p>R$ {{ formatMoney(resumoCaixa.total_arrecadado || 0) }}</p>
        </div>
        <div class="card-footer">
          <span class="click-hint"><i class="bi bi-eye"></i> Clique para ver detalhes</span>
        </div>
      </div>

      <div class="summary-card-large clickable" @click="openDetailModal('gasto')">
        <div class="card-header">
          <div class="card-icon-large expense">
            <i class="bi bi-cart-x"></i>
          </div>
          <div>
            <h3>Total Gasto</h3>
            <p class="subtitle">Soma de todas as saídas</p>
          </div>
        </div>
        <div class="card-amount-large">
          <p>R$ {{ formatMoney(resumoCaixa.total_gasto || 0) }}</p>
        </div>
        <div class="card-footer">
          <span class="click-hint"><i class="bi bi-eye"></i> Clique para ver detalhes</span>
        </div>
      </div>

      <div class="summary-card-large balance clickable" @click="openDetailModal('saldo')">
        <div class="card-header">
          <div class="card-icon-large balance-icon">
            <i class="bi bi-wallet2"></i>
          </div>
          <div>
            <h3>Saldo Atual</h3>
            <p class="subtitle">Caixa disponível</p>
          </div>
        </div>
        <div class="card-amount-large">
          <p :class="getSaldoClass(resumoCaixa.saldo_atual)">R$ {{ formatMoney(resumoCaixa.saldo_atual || 0) }}</p>
        </div>
        <div class="card-footer">
          <span class="click-hint"><i class="bi bi-eye"></i> Clique para ver detalhes</span>
        </div>
      </div>
    </div>

    <!-- Cards do Dia -->
    <div class="summary-cards-day">
      <h3 class="section-title">
        <i class="bi bi-calendar-day"></i> Movimentação de Hoje ({{ formatDate(resumoCaixa.data_hoje) }})
      </h3>
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon revenue">
            <i class="bi bi-arrow-up-circle"></i>
          </div>
          <div class="card-content">
            <h3>Arrecadado Hoje</h3>
            <p class="amount revenue">R$ {{ formatMoney(resumoCaixa.arrecadado_hoje || 0) }}</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon expense">
            <i class="bi bi-arrow-down-circle"></i>
          </div>
          <div class="card-content">
            <h3>Gasto Hoje</h3>
            <p class="amount expense">R$ {{ formatMoney(resumoCaixa.gasto_hoje || 0) }}</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon balance">
            <i class="bi bi-calculator"></i>
          </div>
          <div class="card-content">
            <h3>Saldo do Dia</h3>
            <p class="amount" :class="getSaldoClass(resumoCaixa.saldo_hoje)">R$ {{ formatMoney(resumoCaixa.saldo_hoje || 0) }}</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon pending">
            <i class="bi bi-hourglass-split"></i>
          </div>
          <div class="card-content">
            <h3>Pagamentos Pendentes</h3>
            <p class="amount">{{ pagamentosPendentes }}</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon paid">
            <i class="bi bi-check-circle"></i>
          </div>
          <div class="card-content">
            <h3>Pagamentos Aprovados</h3>
            <p class="amount">{{ pagamentosAprovados }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs para diferentes visualizações -->
    <div class="tabs-section">
      <div class="tabs">
        <button 
          :class="['tab', { active: activeTab === 'pagamentos' }]"
          @click="activeTab = 'pagamentos'">
          Pagamentos
        </button>
        <button 
          :class="['tab', { active: activeTab === 'entradas' }]"
          @click="activeTab = 'entradas'">
          Entradas
        </button>
        <button 
          :class="['tab', { active: activeTab === 'saidas' }]"
          @click="activeTab = 'saidas'">
          Saídas
        </button>
      </div>
    </div>

    <!-- Lista de Pagamentos -->
    <div v-if="activeTab === 'pagamentos'" class="payments-section">
      <div class="header-actions">
        <h3>Pagamentos de Pedidos e Inscrições</h3>
        <div class="filter-controls">
          <select v-model="statusFilter" @change="filterPayments">
            <option value="">Todos</option>
            <option value="pago">Pagos</option>
            <option value="pendente">Pendentes</option>
          </select>
          <select v-model="tipoFilter" @change="filterPayments">
            <option value="">Todos os Tipos</option>
            <option value="pedido">Pedidos</option>
            <option value="inscricao">Inscrições</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Item</th>
              <th>Tipo</th>
              <th>Valor Pago</th>
              <th>Método</th>
              <th>Parcelas</th>
              <th>Status</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pagamento in pagamentosFiltrados" :key="pagamento.id">
              <td>{{ formatDate(pagamento.data_pagamento) }}</td>
              <td><strong>{{ pagamento.cliente_nome || '-' }}</strong></td>
              <td>{{ pagamento.descricao_item || '-' }}</td>
              <td>
                <span class="tipo-badge" :class="`tipo-${pagamento.tipo_modelo}`">
                  {{ getTipoDisplay(pagamento.tipo_modelo) }}
                </span>
              </td>
              <td><strong>R$ {{ formatMoney(pagamento.valor_pago) }}</strong></td>
              <td>
                <span v-if="pagamento.payment_method === 'credit_card'">
                  <i class="bi bi-credit-card"></i> Cartão
                </span>
                <span v-else-if="pagamento.payment_method === 'pix'">
                  <i class="bi bi-qr-code"></i> PIX
                </span>
                <span v-else>-</span>
              </td>
              <td>{{ pagamento.numero_parcela }}x</td>
              <td>
                <span :class="['status-badge', getStatusClass(pagamento.status_pagamento)]">
                  {{ getStatusDisplay(pagamento.status_pagamento) }}
                </span>
              </td>
              <td class="text-center">
                <router-link 
                  v-if="pagamento.tipo_modelo === 'pedido' && pagamento.status_pagamento === 'pago'" 
                  :to="`/nota/pedido/${pagamento.objeto_id}`" 
                  class="btn-nota" 
                  title="Visualizar Nota Fiscal">
                  <i class="bi bi-file-earmark-text"></i> Nota
                </router-link>
                <span v-else class="text-muted">-</span>
              </td>
            </tr>
            <tr v-if="pagamentosFiltrados.length === 0">
              <td colspan="9" class="text-center empty-state">
                <i class="bi bi-inbox"></i>
                <p>Nenhum pagamento encontrado</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Lista de Entradas -->
    <div v-if="activeTab === 'entradas'" class="payments-section">
      <div class="header-actions">
        <h3>Entradas do Caixa</h3>
        <div class="header-right">
          <div class="total-info">
            <span>Total: <strong>R$ {{ formatMoney(totalEntradas) }}</strong></span>
          </div>
          <button @click="loadEntradas" class="btn-reload" title="Recarregar">
            <i class="bi bi-arrow-clockwise"></i> Recarregar
          </button>
        </div>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th class="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingEntradas">
              <td colspan="3" class="text-center">
                <div class="loading-spinner">
                  <i class="bi bi-arrow-repeat"></i> Carregando...
                </div>
              </td>
            </tr>
            <tr v-for="entrada in entradas" :key="entrada.id" v-show="!loadingEntradas">
              <td>
                <div class="date-cell">
                  <i class="bi bi-calendar-event"></i>
                  {{ formatDate(entrada.data) }}
                </div>
              </td>
              <td>
                <div class="description-cell">
                  {{ entrada.descricao || '-' }}
                </div>
              </td>
              <td class="text-right">
                <strong class="value-positive">R$ {{ formatMoney(entrada.valor) }}</strong>
              </td>
            </tr>
            <tr v-if="entradas.length === 0 && !loadingEntradas">
              <td colspan="3" class="text-center empty-state">
                <i class="bi bi-inbox"></i>
                <p>Nenhuma entrada encontrada</p>
                <small style="color: #999; margin-top: 8px; display: block;">
                  As entradas são criadas automaticamente quando há pagamentos aprovados.
                </small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Lista de Saídas -->
    <div v-if="activeTab === 'saidas'" class="payments-section">
      <div class="header-actions">
        <h3>Saídas do Caixa</h3>
        <div class="total-info">
          <span>Total: <strong>R$ {{ formatMoney(totalSaidas) }}</strong></span>
        </div>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th class="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="saida in saidas" :key="saida.id">
              <td>
                <div class="date-cell">
                  <i class="bi bi-calendar-event"></i>
                  {{ formatDate(saida.data) }}
                </div>
              </td>
              <td>
                <div class="description-cell">
                  {{ saida.descricao || '-' }}
                </div>
              </td>
              <td class="text-right">
                <strong class="value-negative">R$ {{ formatMoney(saida.valor) }}</strong>
              </td>
            </tr>
            <tr v-if="saidas.length === 0">
              <td colspan="3" class="text-center empty-state">
                <i class="bi bi-inbox"></i>
                <p>Nenhuma saída encontrada</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Detalhes -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ getModalTitle() }}</h3>
          <button @click="closeDetailModal" class="btn-close-modal">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <!-- Detalhes do Total Arrecadado -->
          <div v-if="detailModalType === 'arrecadado'" class="detail-section">
            <div class="detail-summary">
              <h4>Resumo</h4>
              <p class="total-amount">Total: <strong>R$ {{ formatMoney(resumoCaixa.total_arrecadado || 0) }}</strong></p>
              <p class="total-count">{{ entradas.length }} {{ entradas.length === 1 ? 'entrada' : 'entradas' }}</p>
            </div>
            <div class="detail-table-container">
              <table class="detail-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th class="text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entrada in entradas" :key="entrada.id">
                    <td>{{ formatDate(entrada.data) }}</td>
                    <td>{{ entrada.descricao }}</td>
                    <td class="text-right"><strong>R$ {{ formatMoney(entrada.valor) }}</strong></td>
                  </tr>
                  <tr v-if="entradas.length === 0">
                    <td colspan="3" class="text-center empty-state">
                      <i class="bi bi-inbox"></i>
                      <p>Nenhuma entrada encontrada</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Detalhes do Total Gasto -->
          <div v-if="detailModalType === 'gasto'" class="detail-section">
            <div class="detail-summary">
              <h4>Resumo</h4>
              <p class="total-amount">Total: <strong>R$ {{ formatMoney(resumoCaixa.total_gasto || 0) }}</strong></p>
              <p class="total-count">{{ saidas.length }} {{ saidas.length === 1 ? 'saída' : 'saídas' }}</p>
            </div>
            <div class="detail-table-container">
              <table class="detail-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th class="text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="saida in saidas" :key="saida.id">
                    <td>{{ formatDate(saida.data) }}</td>
                    <td>{{ saida.descricao }}</td>
                    <td class="text-right"><strong>R$ {{ formatMoney(saida.valor) }}</strong></td>
                  </tr>
                  <tr v-if="saidas.length === 0">
                    <td colspan="3" class="text-center empty-state">
                      <i class="bi bi-inbox"></i>
                      <p>Nenhuma saída encontrada</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Detalhes do Saldo Atual -->
          <div v-if="detailModalType === 'saldo'" class="detail-section">
            <div class="detail-summary balance-summary">
              <h4>Resumo do Saldo</h4>
              <div class="balance-breakdown">
                <div class="breakdown-item">
                  <span class="label">Total Arrecadado:</span>
                  <span class="value positive">R$ {{ formatMoney(resumoCaixa.total_arrecadado || 0) }}</span>
                </div>
                <div class="breakdown-item">
                  <span class="label">Total Gasto:</span>
                  <span class="value negative">R$ {{ formatMoney(resumoCaixa.total_gasto || 0) }}</span>
                </div>
                <div class="breakdown-item total">
                  <span class="label">Saldo Atual:</span>
                  <span class="value" :class="getSaldoClass(resumoCaixa.saldo_atual)">R$ {{ formatMoney(resumoCaixa.saldo_atual || 0) }}</span>
                </div>
              </div>
            </div>
            <div class="detail-tabs">
              <button 
                :class="['detail-tab', { active: detailSubTab === 'entradas' }]"
                @click="detailSubTab = 'entradas'">
                Entradas ({{ entradas.length }})
              </button>
              <button 
                :class="['detail-tab', { active: detailSubTab === 'saidas' }]"
                @click="detailSubTab = 'saidas'">
                Saídas ({{ saidas.length }})
              </button>
            </div>
            <div class="detail-table-container">
              <table v-if="detailSubTab === 'entradas'" class="detail-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th class="text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entrada in entradas" :key="entrada.id">
                    <td>{{ formatDate(entrada.data) }}</td>
                    <td>{{ entrada.descricao }}</td>
                    <td class="text-right"><strong class="positive">R$ {{ formatMoney(entrada.valor) }}</strong></td>
                  </tr>
                  <tr v-if="entradas.length === 0">
                    <td colspan="3" class="text-center empty-state">
                      <i class="bi bi-inbox"></i>
                      <p>Nenhuma entrada encontrada</p>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table v-if="detailSubTab === 'saidas'" class="detail-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th class="text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="saida in saidas" :key="saida.id">
                    <td>{{ formatDate(saida.data) }}</td>
                    <td>{{ saida.descricao }}</td>
                    <td class="text-right"><strong class="negative">R$ {{ formatMoney(saida.valor) }}</strong></td>
                  </tr>
                  <tr v-if="saidas.length === 0">
                    <td colspan="3" class="text-center empty-state">
                      <i class="bi bi-inbox"></i>
                      <p>Nenhuma saída encontrada</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDetailModal" class="btn-cancel">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import api from '../services/api'

const pagamentos = ref([])
const entradas = ref([])
const saidas = ref([])
const statusFilter = ref('')
const tipoFilter = ref('')
const activeTab = ref('pagamentos')
const loadingEntradas = ref(false)
const showDetailModal = ref(false)
const detailModalType = ref('') // 'arrecadado', 'gasto', 'saldo'
const detailSubTab = ref('entradas')
const resumoCaixa = ref({
  total_arrecadado: 0,
  total_gasto: 0,
  saldo_atual: 0,
  arrecadado_hoje: 0,
  gasto_hoje: 0,
  saldo_hoje: 0,
  data_hoje: new Date().toISOString().split('T')[0]
})

const pagamentosFiltrados = computed(() => {
  let filtered = pagamentos.value
  
  if (statusFilter.value) {
    filtered = filtered.filter(p => p.status_pagamento === statusFilter.value)
  }
  
  if (tipoFilter.value) {
    filtered = filtered.filter(p => p.tipo_modelo === tipoFilter.value)
  }
  
  return filtered
})

const totalRecebido = computed(() => {
  return pagamentos.value
    .filter(p => p.status_pagamento === 'pago')
    .reduce((sum, p) => sum + parseFloat(p.valor_pago || 0), 0)
})

const pagamentosPendentes = computed(() => {
  return pagamentos.value.filter(p => p.status_pagamento === 'pendente').length
})

const pagamentosAprovados = computed(() => {
  return pagamentos.value.filter(p => p.status_pagamento === 'pago').length
})

const totalEntradas = computed(() => {
  return entradas.value.reduce((sum, e) => sum + parseFloat(e.valor || 0), 0)
})

const totalSaidas = computed(() => {
  return saidas.value.reduce((sum, s) => sum + parseFloat(s.valor || 0), 0)
})

async function loadPayments() {
  try {
    const { data } = await api.get('/pagamentos/caixa/')
    pagamentos.value = data
  } catch (error) {
    console.error('Erro ao carregar pagamentos:', error)
  }
}

async function loadEntradas() {
  loadingEntradas.value = true
  try {
    console.log('Carregando entradas...')
    const response = await api.get('/entradas/')
    console.log('Resposta da API:', response)
    const data = response.data
    
    // Se houver paginação, pegar todos os resultados
    if (data.results && Array.isArray(data.results)) {
      console.log('Dados paginados encontrados:', data.results.length)
      entradas.value = data.results
      
      // Se houver próxima página, carregar também
      let nextUrl = data.next
      while (nextUrl) {
        try {
          const cleanUrl = nextUrl.replace(/https?:\/\/[^/]+/, '')
          const nextResponse = await api.get(cleanUrl)
          if (nextResponse.data.results && Array.isArray(nextResponse.data.results)) {
            entradas.value = [...entradas.value, ...nextResponse.data.results]
          }
          nextUrl = nextResponse.data.next
        } catch (err) {
          console.error('Erro ao carregar próxima página:', err)
          break
        }
      }
    } else if (Array.isArray(data)) {
      console.log('Dados como array:', data.length)
      entradas.value = data
    } else {
      console.warn('Formato de dados inesperado:', data)
      entradas.value = []
    }
    
    console.log('Total de entradas carregadas:', entradas.value.length)
    
    // Ordenar por data mais recente primeiro
    if (entradas.value.length > 0) {
      entradas.value.sort((a, b) => {
        const dateA = new Date(a.data)
        const dateB = new Date(b.data)
        return dateB - dateA
      })
    }
  } catch (error) {
    console.error('Erro ao carregar entradas:', error)
    console.error('Detalhes do erro:', error.response?.data || error.message)
    alert('Erro ao carregar entradas: ' + (error.response?.data?.detail || error.message))
    entradas.value = []
  } finally {
    loadingEntradas.value = false
  }
}

async function loadSaidas() {
  try {
    console.log('Carregando saídas...')
    const response = await api.get('/saidas/')
    const data = response.data
    
    // Se houver paginação, pegar todos os resultados
    if (data.results && Array.isArray(data.results)) {
      saidas.value = data.results
      
      // Se houver próxima página, carregar também
      let nextUrl = data.next
      while (nextUrl) {
        try {
          const cleanUrl = nextUrl.replace(/https?:\/\/[^/]+/, '')
          const nextResponse = await api.get(cleanUrl)
          if (nextResponse.data.results && Array.isArray(nextResponse.data.results)) {
            saidas.value = [...saidas.value, ...nextResponse.data.results]
          }
          nextUrl = nextResponse.data.next
        } catch (err) {
          console.error('Erro ao carregar próxima página:', err)
          break
        }
      }
    } else if (Array.isArray(data)) {
      saidas.value = data
    } else {
      saidas.value = []
    }
    
    // Ordenar por data mais recente primeiro
    if (saidas.value.length > 0) {
      saidas.value.sort((a, b) => {
        const dateA = new Date(a.data)
        const dateB = new Date(b.data)
        return dateB - dateA
      })
    }
  } catch (error) {
    console.error('Erro ao carregar saídas:', error)
    saidas.value = []
  }
}

function filterPayments() {
  // O filtro é aplicado automaticamente pelo computed
}

function getTipoDisplay(tipo) {
  const tipos = {
    'pedido': 'Pedido',
    'inscricao': 'Inscrição',
    'planejamento': 'Planejamento'
  }
  return tipos[tipo] || tipo
}

function getStatusDisplay(status) {
  const statusMap = {
    'pendente': 'Pendente',
    'pago': 'Pago',
    'cancelado': 'Cancelado',
    'reembolsado': 'Reembolsado'
  }
  return statusMap[status] || status
}

function getStatusClass(status) {
  const classMap = {
    'pendente': 'status-pendente',
    'pago': 'status-pago',
    'cancelado': 'status-cancelado',
    'reembolsado': 'status-reembolsado'
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


// Recarregar dados quando a aba mudar
watch(activeTab, (newTab) => {
  if (newTab === 'entradas' && entradas.value.length === 0) {
    loadEntradas()
  } else if (newTab === 'saidas' && saidas.value.length === 0) {
    loadSaidas()
  }
})

async function loadResumoCaixa() {
  try {
    const { data } = await api.get('/entradas/resumo/')
    resumoCaixa.value = data
  } catch (error) {
    console.error('Erro ao carregar resumo do caixa:', error)
  }
}

function getSaldoClass(valor) {
  const saldo = parseFloat(valor || 0)
  if (saldo > 0) return 'amount-positive'
  if (saldo < 0) return 'amount-negative'
  return 'amount-neutral'
}

onMounted(async () => {
  await Promise.all([
    loadPayments(),
    loadEntradas(),
    loadSaidas(),
    loadResumoCaixa()
  ])
})

// Recarregar resumo quando mudar de aba para atualizar valores
watch(activeTab, () => {
  loadResumoCaixa()
})

function openDetailModal(type) {
  console.log('openDetailModal chamado com tipo:', type)
  detailModalType.value = type
  detailSubTab.value = 'entradas'
  showDetailModal.value = true
  console.log('showDetailModal:', showDetailModal.value, 'detailModalType:', detailModalType.value)
  // Garantir que dados estão carregados
  if (entradas.value.length === 0) loadEntradas()
  if (saidas.value.length === 0) loadSaidas()
}

function closeDetailModal() {
  showDetailModal.value = false
  detailModalType.value = ''
}

function getModalTitle() {
  const titles = {
    'arrecadado': 'Detalhes do Total Arrecadado',
    'gasto': 'Detalhes do Total Gasto',
    'saldo': 'Detalhes do Saldo Atual'
  }
  return titles[detailModalType.value] || 'Detalhes'
}
</script>

<style scoped>
.page-container { padding: 0; }
h2 { font-size: 1.75rem; color: #2c3e50; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 3px solid #667eea; }

/* Cards principais grandes */
.summary-cards-main { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 32px; }
.summary-card-large { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.summary-card-large.balance { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.card-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.card-icon-large { width: 64px; height: 64px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2rem; }
.card-icon-large.revenue { background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); color: #155724; }
.card-icon-large.expense { background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); color: #721c24; }
.card-icon-large.balance-icon { background: rgba(255,255,255,0.2); color: white; }
.card-header h3 { margin: 0; font-size: 1.1rem; font-weight: 600; }
.summary-card-large.balance .card-header h3 { color: white; }
.card-header .subtitle { margin: 4px 0 0 0; font-size: 0.85rem; opacity: 0.7; }
.summary-card-large.balance .subtitle { color: white; }
.card-amount-large p { margin: 0; font-size: 2.5rem; font-weight: 700; color: #2c3e50; }
.summary-card-large.balance .card-amount-large p { color: white; }
.clickable { cursor: pointer; transition: all 0.3s; }
.clickable:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.card-footer { margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.1); }
.summary-card-large.balance .card-footer { border-top-color: rgba(255,255,255,0.2); }
.click-hint { font-size: 0.85rem; color: #718096; display: flex; align-items: center; gap: 6px; }
.summary-card-large.balance .click-hint { color: rgba(255,255,255,0.9); }
.clickable:hover .click-hint { color: #667eea; }
.summary-card-large.balance.clickable:hover .click-hint { color: white; }

/* Cards do dia */
.summary-cards-day { margin-bottom: 32px; }
.section-title { font-size: 1.3rem; color: #2c3e50; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
.summary-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; align-items: center; gap: 16px; }
.card-icon { width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.card-icon.revenue { background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); color: #155724; }
.card-icon.expense { background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); color: #721c24; }
.card-icon.balance { background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); color: #1976d2; }
.card-icon.pending { background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); color: #856404; }
.card-icon.paid { background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%); color: #0c5460; }
.card-content h3 { margin: 0 0 8px 0; color: #2d3748; font-size: 0.9rem; font-weight: 600; }
.card-content .amount { margin: 0; color: #2c3e50; font-size: 1.5rem; font-weight: 700; }
.amount-positive { color: #28a745 !important; }
.amount-negative { color: #dc3545 !important; }
.amount-neutral { color: #6c757d !important; }
.amount.revenue { color: #28a745; }
.amount.expense { color: #dc3545; }

.payments-section { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
.header-actions { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-bottom: 2px solid #e1e5e9; }
.header-actions h3 { margin: 0; color: #2c3e50; font-size: 1.5rem; font-weight: 600; }
.filter-controls { display: flex; gap: 12px; }
.filter-controls select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background: white; }

.table-container { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
thead { background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); }
th { padding: 16px 20px; text-align: left; font-weight: 600; color: #2c3e50; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.5px; }
td { padding: 16px 20px; border-bottom: 1px solid #e1e5e9; color: #4a5568; }
.text-center { text-align: center; }
tbody tr:hover { background: #f8f9fa; }

.tipo-badge { padding: 4px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; }
.tipo-pedido { background: #e6fffa; color: #2c7a7b; }
.tipo-inscricao { background: #e0e7ff; color: #4338ca; }
.tipo-planejamento { background: #fef3c7; color: #92400e; }

.status-badge { padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; }
.status-pendente { background: #fff3cd; color: #856404; }
.status-pago { background: #d4edda; color: #155724; }
.status-cancelado { background: #f8d7da; color: #721c24; }
.status-reembolsado { background: #f8d7da; color: #721c24; }

.btn-nota { background: #e6fffa; color: #2c7a7b; padding: 8px 12px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; }
.btn-nota:hover { background: #b2f5ea; }

.empty-state { padding: 60px 20px; color: #a0aec0; }
.empty-state i { font-size: 3rem; margin-bottom: 16px; display: block; }
.empty-state p { font-size: 1rem; font-weight: 500; }

.text-muted { color: #a0aec0; }

/* Tabs */
.tabs-section { margin-bottom: 24px; }
.tabs { display: flex; gap: 8px; background: white; padding: 8px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.tab { flex: 1; padding: 12px 24px; border: none; background: transparent; border-radius: 8px; cursor: pointer; font-weight: 600; color: #718096; transition: all 0.3s; }
.tab:hover { background: #f8f9fa; }
.tab.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }

/* Header actions */
.header-right { display: flex; align-items: center; gap: 16px; }
.btn-reload { padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
.btn-reload:hover { background: #5568d3; transform: translateY(-1px); }
.btn-reload i { animation: none; }
.btn-reload:active i { animation: spin 0.5s linear; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-spinner { padding: 40px; color: #667eea; }
.loading-spinner i { animation: spin 1s linear infinite; margin-right: 8px; }

/* Melhorias na tabela de entradas e saídas */
.total-info { font-size: 0.9rem; color: #2c3e50; }
.total-info strong { font-size: 1.1rem; color: #667eea; }

.date-cell { display: flex; align-items: center; gap: 8px; }
.date-cell i { color: #667eea; font-size: 0.9rem; }

.description-cell { max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.text-right { text-align: right; }

.value-positive { color: #28a745; font-size: 1rem; }
.value-negative { color: #dc3545; font-size: 1rem; }

tbody tr:hover { background: #f8f9fa; }
tbody tr:hover .value-positive { color: #218838; }
tbody tr:hover .value-negative { color: #c82333; }

/* Modal de Detalhes */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
.modal-content { background: white; border-radius: 16px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-header { padding: 24px; border-bottom: 2px solid #e1e5e9; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px 16px 0 0; }
.modal-header h3 { margin: 0; font-size: 1.5rem; }
.btn-close-modal { background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-close-modal:hover { background: rgba(255,255,255,0.3); }
.modal-body { padding: 24px; }
.modal-footer { padding: 24px; border-top: 2px solid #e1e5e9; display: flex; gap: 12px; justify-content: flex-end; }
.btn-cancel { padding: 10px 20px; background: #e1e5e9; color: #2c3e50; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.btn-cancel:hover { background: #cbd5e0; }

.detail-modal { max-width: 900px; max-height: 85vh; }
.detail-section { display: flex; flex-direction: column; gap: 20px; }
.detail-summary { background: #f8f9fa; padding: 20px; border-radius: 12px; }
.detail-summary h4 { margin: 0 0 12px 0; color: #2c3e50; font-size: 1.1rem; }
.total-amount { margin: 8px 0; font-size: 1.2rem; color: #2c3e50; }
.total-count { margin: 0; color: #718096; font-size: 0.9rem; }

.balance-summary { background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); }
.balance-breakdown { display: flex; flex-direction: column; gap: 12px; }
.breakdown-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px; }
.breakdown-item.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; }
.breakdown-item .label { font-size: 0.95rem; }
.breakdown-item.total .label { color: white; }
.breakdown-item .value { font-size: 1.1rem; font-weight: 700; }
.breakdown-item .value.positive { color: #28a745; }
.breakdown-item .value.negative { color: #dc3545; }
.breakdown-item.total .value { color: white; }

.detail-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.detail-tab { padding: 10px 20px; border: 2px solid #e1e5e9; background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: #718096; transition: all 0.2s; }
.detail-tab:hover { border-color: #667eea; color: #667eea; }
.detail-tab.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-color: #667eea; color: white; }

.detail-table-container { max-height: 400px; overflow-y: auto; }
.detail-table { width: 100%; border-collapse: collapse; }
.detail-table thead { position: sticky; top: 0; background: #f8f9fa; z-index: 1; }
.detail-table th { padding: 12px 16px; text-align: left; font-weight: 600; color: #2c3e50; font-size: 0.875rem; text-transform: uppercase; border-bottom: 2px solid #e1e5e9; }
.detail-table td { padding: 12px 16px; border-bottom: 1px solid #e1e5e9; color: #4a5568; }
.detail-table tbody tr:hover { background: #f8f9fa; }
.detail-table .positive { color: #28a745; }
.detail-table .negative { color: #dc3545; }

@media (max-width: 768px) {
  .summary-cards { grid-template-columns: 1fr; }
  .header-actions { flex-direction: column; gap: 16px; align-items: stretch; }
  .filter-controls { flex-direction: column; }
  .table-container { overflow-x: scroll; }
  .detail-modal { width: 95%; max-height: 90vh; }
  .balance-breakdown { gap: 8px; }
  .breakdown-item { flex-direction: column; align-items: flex-start; gap: 4px; }
}
</style>
