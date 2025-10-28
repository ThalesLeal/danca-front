<template>
  <div class="page-container">
    <h2>Pagamentos</h2>

    <!-- Modal Criar/Editar -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>{{ form.id ? 'Editar Pagamento' : 'Novo Pagamento' }}</h4>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAndClose">
            <div class="form-group">
              <label>Tipo de Pagamento</label>
              <select v-model="form.tipo_modelo" @change="carregarOpcoes" required>
                <option value="">Selecione</option>
                <option value="inscricao">Inscrição</option>
                <option value="planejamento">Planejamento</option>
              </select>
            </div>

            <div v-if="form.tipo_modelo" class="form-group">
              <label>{{ form.tipo_modelo === 'inscricao' ? 'Inscrição' : 'Planejamento' }}</label>
              <select v-model="form.pagamento_relacionado_id" required>
                <option value="">Selecione...</option>
                <option v-for="item in opcoesRelacionadas" :key="item.id" :value="item.id">
                  {{ item.nome }}
                </option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Nº Parcela</label>
                <input v-model.number="form.numero_parcela" type="number" min="1" placeholder="1" required />
              </div>
              <div class="form-group">
                <label>Valor Pago</label>
                <input v-model.number="form.valor_pago" type="number" step="0.01" placeholder="0.00" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Data Pagamento</label>
                <input v-model="form.data_pagamento" type="date" />
              </div>
              <div class="form-group">
                <label>Próximo Pagamento</label>
                <input v-model="form.data_proximo_pagamento" type="date" />
              </div>
            </div>

            <div class="modal-actions">
              <button type="submit" class="btn-save">{{ form.id ? 'Atualizar' : 'Adicionar' }}</button>
              <button type="button" @click="closeModal" class="btn-cancel">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Lista -->
    <div class="list-section">
      <div class="header-actions">
        <h3>Pagamentos</h3>
        <div class="actions-group">
          <select v-model="filtroStatus" @change="fetchPagamentos" class="filter-select">
            <option value="">Todos</option>
            <option value="pendente">Pendentes</option>
            <option value="pago">Pagos</option>
            <option value="cancelado">Cancelados</option>
          </select>
          <button @click="createNew" class="btn-new">
            <i class="bi bi-plus-lg"></i> Novo Pagamento
          </button>
        </div>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Data</th>
              <th>Parcela</th>
              <th>Status</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pag in pagamentos.results || pagamentos" :key="pag.id">
              <td><span class="badge">{{ pag.tipo_modelo }}</span></td>
              <td>R$ {{ formatMoney(pag.valor_pago) }}</td>
              <td>{{ formatDate(pag.data_pagamento) }}</td>
              <td>{{ pag.numero_parcela }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(pag.status_pagamento)]">
                  {{ getStatusDisplay(pag.status_pagamento) }}
                </span>
              </td>
              <td class="text-center">
                <button @click="edit(pag)" class="btn-edit" title="Editar"><i class="bi bi-pencil-square"></i></button>
                <button @click="remove(pag)" class="btn-delete" title="Excluir"><i class="bi bi-trash3-fill"></i></button>
              </td>
            </tr>
            <tr v-if="(!pagamentos.results || pagamentos.results.length === 0) && (!pagamentos || pagamentos.length === 0)">
              <td colspan="6" class="text-center empty-state"><i class="bi bi-inbox"></i><p>Nenhum pagamento encontrado</p></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import api from '../services/api'

const pagamentos = reactive({})
const inscricoes = ref([])
const planejamentos = ref([])
const opcoesRelacionadas = ref([])
const filtroStatus = ref('')
const form = reactive({ 
  id: null, 
  tipo_modelo: '', 
  pagamento_relacionado_id: null, 
  numero_parcela: 1, 
  valor_pago: null, 
  data_pagamento: '', 
  data_proximo_pagamento: '', 
})
const showModal = ref(false)

async function fetchPagamentos(url = null) {
  let endpoint = url || '/pagamentos/'
  if (filtroStatus.value) {
    endpoint += `?status_pagamento=${filtroStatus.value}`
  }
  const { data } = await api.get(endpoint)
  Object.assign(pagamentos, data)
}

async function fetchInscricoes() {
  const { data } = await api.get('/inscricoes/')
  inscricoes.value = Array.isArray(data) ? data : (data.results || [])
}

async function fetchPlanejamentos() {
  const { data } = await api.get('/planejamentos/')
  planejamentos.value = Array.isArray(data) ? data : (data.results || [])
}

function carregarOpcoes() {
  if (form.tipo_modelo === 'inscricao') {
    opcoesRelacionadas.value = inscricoes.value.map(i => ({ id: i.id, nome: `${i.nome} - R$ ${formatMoney(i.valor_total)}` }))
  } else if (form.tipo_modelo === 'planejamento') {
    opcoesRelacionadas.value = planejamentos.value.map(p => ({ id: p.id, nome: `${p.descricao} - R$ ${formatMoney(p.valor_planejado)}` }))
  }
}

function createNew() { 
  Object.assign(form, { id: null, tipo_modelo: '', pagamento_relacionado_id: null, numero_parcela: 1, valor_pago: null, data_pagamento: '', data_proximo_pagamento: '' })
  showModal.value = true 
}

function edit(p) { 
  Object.assign(form, p)
  carregarOpcoes()
  showModal.value = true 
}

function reset() { 
  Object.assign(form, { id: null, tipo_modelo: '', pagamento_relacionado_id: null, numero_parcela: 1, valor_pago: null, data_pagamento: '', data_proximo_pagamento: '' })
}

function closeModal() { 
  reset()
  showModal.value = false 
}

async function save() {
  const dados = { ...form }
  dados.tipo_modelo = form.tipo_modelo
  dados.pagamento_relacionado_id = form.pagamento_relacionado_id
  
  if (form.id) {
    await api.put(`/pagamentos/${form.id}/`, dados)
  } else {
    await api.post('/pagamentos/', dados)
  }
  await fetchPagamentos()
}

async function saveAndClose() { 
  await save()
  closeModal() 
}

async function remove(p) {
  if (confirm(`Excluir pagamento de R$ ${formatMoney(p.valor_pago)}?`)) {
    await api.delete(`/pagamentos/${p.id}/`)
    await fetchPagamentos()
  }
}

function formatMoney(value) { return parseFloat(value || 0).toFixed(2) }

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleDateString('pt-BR')
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

onMounted(async () => { await Promise.all([fetchPagamentos(), fetchInscricoes(), fetchPlanejamentos()]) })
</script>

<style scoped>
.page-container { padding: 0; }
h2 { font-size: 1.75rem; color: #2c3e50; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 3px solid #667eea; }

.list-section { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
.header-actions { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-bottom: 2px solid #e1e5e9; }
.header-actions h3 { margin: 0; color: #2c3e50; font-size: 1.5rem; font-weight: 600; }
.actions-group { display: flex; gap: 12px; align-items: center; }
.filter-select { padding: 10px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.9rem; }
.btn-new { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
.btn-new:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5); }
.table-container { overflow-x: auto; }

table { width: 100%; border-collapse: collapse; }
thead { background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); }
th { padding: 16px 20px; text-align: left; font-weight: 600; color: #2c3e50; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.5px; }
td { padding: 16px 20px; border-bottom: 1px solid #e1e5e9; color: #4a5568; }
.text-center { text-align: center; }
tbody tr:hover { background: #f8f9fa; }

.badge { background: #667eea; color: white; padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }

.status-badge { padding: 6px 16px; border-radius: 8px; font-size: 0.875rem; font-weight: 600; display: inline-block; }
.status-pendente { background: #fff3cd; color: #856404; }
.status-pago { background: #d4edda; color: #155724; }
.status-cancelado { background: #f8d7da; color: #721c24; }
.status-reembolsado { background: #e7f3ff; color: #004085; }

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
.modal-content { background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 20px; max-width: 700px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 28px 32px; border-bottom: 2px solid #e1e5e9; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px 20px 0 0; }
.modal-header h4 { margin: 0; color: white; font-size: 1.5rem; font-weight: 600; }
.close-btn { background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); font-size: 1.5rem; color: #fff; cursor: pointer; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; transition: all 0.3s; }
.close-btn:hover { background: rgba(255,255,255,0.3); transform: rotate(90deg); }
.modal-body { padding: 32px; }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
label { font-weight: 600; color: #2c3e50; font-size: 0.9rem; }
input, select { padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
input:focus, select:focus { outline: none; border-color: #667eea; }
.modal-actions { display: flex; gap: 16px; margin-top: 20px; justify-content: flex-end; }
.modal-actions .btn-save { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 32px; font-size: 1rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(102,126,234,0.4); transition: all 0.3s; }
.modal-actions .btn-save:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.5); }
.modal-actions .btn-cancel { background: rgba(245,101,101,0.1); color: #f56565; border: 2px solid #f56565; padding: 14px 32px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.3s; }
.modal-actions .btn-cancel:hover { background: #f56565; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,101,101,0.4); }
</style>
