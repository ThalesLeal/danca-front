<template>
  <div class="page-container">
    <!-- Banner -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1><i class="bi bi-tshirt"></i> Gestão de Camisas</h1>
        <p>Controle seu estoque de camisas e acompanhe as vendas em tempo real</p>
      </div>
    </div>

    <!-- Cards de Estatísticas -->
    <div class="stats-grid">
      <div class="stat-card total">
        <div class="stat-icon">
          <i class="bi bi-tshirt"></i>
        </div>
        <div class="stat-info">
          <h3>Total de Modelos</h3>
          <p class="stat-value">{{ stats.totalCamisas }}</p>
        </div>
      </div>

      <div class="stat-card estoque">
        <div class="stat-icon">
          <i class="bi bi-box-seam"></i>
        </div>
        <div class="stat-info">
          <h3>Em Estoque</h3>
          <p class="stat-value">{{ stats.totalEstoque }}</p>
        </div>
      </div>

      <div class="stat-card valor-total">
        <div class="stat-icon">
          <i class="bi bi-cash-stack"></i>
        </div>
        <div class="stat-info">
          <h3>Valor Total</h3>
          <p class="stat-value">R$ {{ formatMoney(stats.valorTotalEstoque) }}</p>
        </div>
      </div>

      <div class="stat-card baixo-estoque">
        <div class="stat-icon">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <div class="stat-info">
          <h3>Baixo Estoque</h3>
          <p class="stat-value">{{ stats.baixoEstoque }}</p>
        </div>
      </div>
    </div>

    <!-- Modal de Criação/Edição -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>{{ form.id ? 'Editar Camisa' : 'Nova Camisa' }}</h4>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAndClose">
            <div class="form-group">
              <label>Descrição</label>
              <input v-model="form.descricao" placeholder="Descrição da Camisa" required />
            </div>
            <div class="form-group">
              <label>Tipo</label>
              <select v-model="form.tipo" required>
                <option value="">Selecione</option>
                <option value="oversized">Ampla</option>
                <option value="long">Longa</option>
                <option value="cropped">Cropped</option>
                <option value="regata">Regata</option>
                <option value="normal">Normal</option>
                <option value="baby_look">Baby Look</option>
                <option value="outras">Outras</option>
              </select>
            </div>
            <div class="form-group">
              <label>Quantidade em Estoque</label>
              <input v-model.number="form.quantidade" type="number" min="0" required />
            </div>
            <div class="form-group">
              <label>Valor de Custo</label>
              <input v-model.number="form.valor_compra" type="number" step="0.01" min="0" required />
            </div>
            <div class="form-group">
              <label>Valor de Venda</label>
              <input v-model.number="form.valor_venda" type="number" step="0.01" min="0" required />
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
        <h3>Camisas Cadastradas</h3>
        <button @click="createNew" class="btn-new">
          <i class="bi bi-plus-lg"></i> Nova Camisa
        </button>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Valor Compra</th>
              <th>Valor Venda</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="camisa in camisas.results || camisas" :key="camisa.id">
              <td><strong>{{ camisa.descricao }}</strong></td>
              <td>{{ getTipoDisplay(camisa.tipo) }}</td>
              <td>{{ camisa.quantidade }}</td>
              <td>R$ {{ formatMoney(camisa.valor_compra) }}</td>
              <td>R$ {{ formatMoney(camisa.valor_venda) }}</td>
              <td class="text-center">
                <button @click="edit(camisa)" class="btn-edit" title="Editar">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button @click="remove(camisa)" class="btn-delete" title="Excluir">
                  <i class="bi bi-trash3-fill"></i>
                </button>
              </td>
            </tr>
            <tr v-if="(!camisas.results || camisas.results.length === 0) && (!camisas || camisas.length === 0)">
              <td colspan="6" class="text-center empty-state">
                <i class="bi bi-inbox"></i>
                <p>Nenhuma camisa encontrada</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="camisas.next || camisas.previous" class="pagination">
        <button :disabled="!camisas.previous" @click="go(camisas.previous)" class="btn-page">
          <i class="bi bi-chevron-left"></i> Anterior
        </button>
        <button :disabled="!camisas.next" @click="go(camisas.next)" class="btn-page">
          Próxima <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import api from '../services/api'

const camisas = reactive({})
const form = reactive({ id: null, descricao: '', tipo: '', quantidade: 0, valor_compra: 0, valor_venda: 0 })
const showModal = ref(false)

const stats = reactive({
  totalCamisas: 0,
  totalEstoque: 0,
  valorTotalEstoque: 0,
  baixoEstoque: 0
})

async function fetchCamisas(url = null) {
  const { data } = await api.get(url || '/camisas/?ordering=-data_cadastro')
  Object.assign(camisas, data)
  updateStats()
}

function updateStats() {
  const camisasList = camisas.results || camisas || []
  stats.totalCamisas = camisasList.length
  stats.totalEstoque = camisasList.reduce((sum, c) => sum + (c.quantidade || 0), 0)
  stats.valorTotalEstoque = camisasList.reduce((sum, c) => sum + ((c.quantidade || 0) * (c.valor_venda || 0)), 0)
  stats.baixoEstoque = camisasList.filter(c => (c.quantidade || 0) < 5).length
}

function edit(c) { 
  Object.assign(form, c) 
  showModal.value = true
}

function createNew() {
  Object.assign(form, { id: null, descricao: '', tipo: '', quantidade: 0, valor_compra: 0, valor_venda: 0 })
  showModal.value = true
}

function reset() { 
  Object.assign(form, { id: null, descricao: '', tipo: '', quantidade: 0, valor_compra: 0, valor_venda: 0 }) 
  showModal.value = false
}
function closeModal() { reset() }
async function saveAndClose() { await save(); showModal.value = false }

async function save() {
  if (form.id) {
    await api.put(`/camisas/${form.id}/`, form)
  } else {
    await api.post('/camisas/', form)
  }
  reset()
  await fetchCamisas()
}

async function remove(c) {
  if (confirm(`Excluir camisa "${c.descricao}"?`)) {
    await api.delete(`/camisas/${c.id}/`)
    await fetchCamisas()
  }
}

async function go(url) { 
  if (url) await fetchCamisas(url.replace(import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', '')) 
}

function getTipoDisplay(tipo) {
  const tipos = {
    'oversized': 'Ampla',
    'long': 'Longa',
    'cropped': 'Cropped',
    'regata': 'Regata',
    'normal': 'Normal',
    'baby_look': 'Baby Look',
    'outras': 'Outras'
  }
  return tipos[tipo] || tipo
}

function formatMoney(value) {
  return parseFloat(value || 0).toFixed(2)
}

onMounted(fetchCamisas)
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
.stat-card.total .stat-icon { background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); color: #856404; }
.stat-card.estoque .stat-icon { background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%); color: #0c5460; }
.stat-card.valor-total .stat-icon { background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); color: #155724; }
.stat-card.baixo-estoque .stat-icon { background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); color: #721c24; }
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
.btn-edit, .btn-delete { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; margin: 0 4px; transition: all 0.2s; }
.btn-edit { background: #fef5e7; color: #d68910; }
.btn-edit:hover { background: #fdebd0; }
.btn-delete { background: #fee; color: #c0392b; }
.btn-delete:hover { background: #fdd; }
.empty-state { padding: 60px 20px; color: #a0aec0; }
.empty-state i { font-size: 3rem; margin-bottom: 16px; display: block; }
.empty-state p { font-size: 1rem; font-weight: 500; }
.pagination { display: flex; justify-content: center; gap: 12px; padding: 24px; background: #f8f9fa; }
.btn-page { padding: 12px 24px; border: 2px solid #e1e5e9; background: white; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; font-weight: 600; }
.btn-page:hover:not(:disabled) { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-color: transparent; }
.btn-page:disabled { opacity: 0.5; cursor: not-allowed; }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 40px 20px; }
.modal-content { background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 20px; max-width: 900px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 28px 32px; border-bottom: 2px solid #e1e5e9; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px 20px 0 0; }
.modal-header h4 { margin: 0; color: white; font-size: 1.5rem; font-weight: 600; }
.close-btn { background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); font-size: 1.5rem; color: #fff; cursor: pointer; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; transition: all 0.3s; }
.close-btn:hover { background: rgba(255,255,255,0.3); transform: rotate(90deg); }
.modal-body { padding: 32px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 24px; }
label { font-weight: 600; color: #2c3e50; font-size: 0.9rem; }
input, select { padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
.modal-actions { display: flex; gap: 16px; margin-top: 32px; justify-content: flex-end; }
.modal-actions .btn-save { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 16px 40px; font-size: 1rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(102,126,234,0.4); transition: all 0.3s; }
.modal-actions .btn-save:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.5); }
.modal-actions .btn-cancel { background: rgba(245,101,101,0.1); color: #f56565; border: 2px solid #f56565; padding: 16px 40px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.3s; }
.modal-actions .btn-cancel:hover { background: #f56565; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,101,101,0.4); }

@media (max-width: 768px) {
  .form-actions { flex-direction: column; }
  table { font-size: 0.875rem; }
  th, td { padding: 8px; }
  .modal-content { width: 95%; }
}
</style>
