<template>
  <div class="page-container">
    <h2>Eventos</h2>

    <!-- Modal Criar/Editar -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>{{ form.id ? 'Editar Evento' : 'Novo Evento' }}</h4>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAndClose">
            <div class="form-group">
              <label>Descrição do Evento *</label>
              <input v-model="form.descricao" placeholder="Nome do evento" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Tipo de Evento *</label>
                <select v-model="form.tipo" required>
                  <option value="">Selecione</option>
                  <option v-for="tipo in tiposEvento" :key="tipo.id" :value="tipo.id">{{ tipo.descricao }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Data do Evento</label>
                <input v-model="form.data" type="date" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Quantidade de Vagas</label>
                <input v-model.number="form.quantidade_pessoas" type="number" min="0" placeholder="Número de vagas" />
              </div>
              <div class="form-group">
                <label>Valor Unitário</label>
                <input v-model.number="form.valor_unitario" type="number" step="0.01" min="0" placeholder="R$ 0,00" />
              </div>
            </div>
            <div class="form-group full-width">
              <label>Status</label>
              <select v-model="form.status">
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
                <option value="realizado">Realizado</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn-save" :disabled="saving">
                <span v-if="saving">
                  <i class="bi bi-hourglass-split"></i> Salvando...
                </span>
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
        <h3>Eventos Cadastrados</h3>
        <button @click="createNew" class="btn-new">
          <i class="bi bi-plus-lg"></i> Novo Evento
        </button>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Data</th>
              <th>Vagas</th>
              <th>Valor</th>
              <th>Status</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="evento in eventos.results || eventos" :key="evento.id">
              <td><strong>{{ evento.descricao }}</strong></td>
              <td>{{ getTipoDescricao(evento.tipo) || '-' }}</td>
              <td>{{ formatDate(evento.data) }}</td>
              <td>{{ evento.quantidade_pessoas || '-' }}</td>
              <td>{{ evento.valor_unitario ? 'R$ ' + formatMoney(evento.valor_unitario) : '-' }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(evento.status)]">
                  {{ getStatusDisplay(evento.status) }}
                </span>
              </td>
              <td class="text-center">
                <button @click="edit(evento)" class="btn-edit" title="Editar"><i class="bi bi-pencil-square"></i></button>
                <button @click="remove(evento)" class="btn-delete" title="Excluir"><i class="bi bi-trash3-fill"></i></button>
              </td>
            </tr>
            <tr v-if="(!eventos.results || eventos.results.length === 0) && (!eventos || eventos.length === 0)">
              <td colspan="7" class="text-center empty-state"><i class="bi bi-inbox"></i><p>Nenhum evento encontrado</p></td>
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

const eventos = reactive({})
const tiposEvento = reactive([])
const form = reactive({ id: null, descricao: '', tipo: null, data: '', quantidade_pessoas: null, valor_unitario: null, status: 'pendente' })
const showModal = ref(false)
const saving = ref(false)

async function fetchEventos(url = null) {
  const { data } = await api.get(url || '/eventos/')
  Object.assign(eventos, data)
}

async function fetchTiposEvento() {
  try {
    const { data } = await api.get('/tipo-eventos/')
    const tipos = Array.isArray(data) ? data : (data.results || [])
    tiposEvento.splice(0, tiposEvento.length, ...tipos)
  } catch (error) {
    console.error('Erro ao buscar tipos de evento:', error)
    tiposEvento.splice(0, tiposEvento.length)
  }
}

function getTipoDescricao(tipoId) {
  if (!Array.isArray(tiposEvento)) return ''
  const tipo = tiposEvento.find(t => t.id === tipoId)
  return tipo ? tipo.descricao : ''
}

function createNew() { 
  Object.assign(form, { id: null, descricao: '', tipo: null, data: '', quantidade_pessoas: null, valor_unitario: null, status: 'pendente' })
  showModal.value = true 
}

function edit(e) { 
  Object.assign(form, e)
  showModal.value = true 
}

function reset() { 
  Object.assign(form, { id: null, descricao: '', tipo: null, data: '', quantidade_pessoas: null, valor_unitario: null, status: 'pendente' })
}

function closeModal() { 
  reset()
  showModal.value = false 
}

async function save() {
  saving.value = true
  try {
    const payload = {
      descricao: form.descricao,
      tipo: form.tipo,
      data: form.data || null,
      quantidade_pessoas: form.quantidade_pessoas ?? null,
      valor_unitario: form.valor_unitario ?? null,
      status: form.status,
    }
    console.log('Salvando evento:', payload)
    
    if (form.id) {
      await api.put(`/eventos/${form.id}/`, payload)
    } else {
      await api.post('/eventos/', payload)
    }
    await fetchEventos()
    console.log('Evento salvo com sucesso')
  } catch (error) {
    console.error('Erro ao salvar evento:', error)
    alert('Erro ao salvar evento: ' + (error.response?.data?.error || error.message))
  } finally {
    saving.value = false
  }
}

async function saveAndClose() { 
  if (!form.descricao || !form.tipo) {
    alert('Preencha todos os campos obrigatórios')
    return
  }
  await save()
  closeModal() 
}

async function remove(e) {
  if (confirm(`Excluir evento "${e.descricao}"?`)) {
    await api.delete(`/eventos/${e.id}/`)
    await fetchEventos()
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

onMounted(async () => { await Promise.all([fetchEventos(), fetchTiposEvento()]) })
</script>

<style scoped>
.page-container { padding: 0; }
h2 { font-size: 1.75rem; color: #2c3e50; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 3px solid #667eea; }

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
.status-confirmado { background: #d1ecf1; color: #0c5460; }
.status-cancelado { background: #f8d7da; color: #721c24; }
.status-realizado { background: #d4edda; color: #155724; }

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
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 12px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }
label { font-weight: 600; color: #2c3e50; font-size: 0.9rem; }
input, select { padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
input:focus, select:focus { outline: none; border-color: #667eea; }
.modal-actions { display: flex; gap: 16px; margin-top: 20px; justify-content: flex-end; }
.modal-actions .btn-save { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 32px; font-size: 1rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(102,126,234,0.4); transition: all 0.3s; cursor: pointer; }
.modal-actions .btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.5); }
.modal-actions .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.modal-actions .btn-cancel { background: rgba(245,101,101,0.1); color: #f56565; border: 2px solid #f56565; padding: 14px 32px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.3s; }
.modal-actions .btn-cancel:hover { background: #f56565; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,101,101,0.4); }
</style>
