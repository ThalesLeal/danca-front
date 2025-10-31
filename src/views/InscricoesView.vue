<template>
  <div class="page-container">
    <!-- Banner -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1><i class="bi bi-person-plus"></i> Gestão de Inscrições</h1>
        <p>Cadastre e gerencie participantes dos seus eventos de forma simples</p>
      </div>
    </div>

    <!-- Cards de Estatísticas -->
    <div class="stats-grid">
      <div class="stat-card total">
        <div class="stat-icon">
          <i class="bi bi-people"></i>
        </div>
        <div class="stat-info">
          <h3>Total de Inscrições</h3>
          <p class="stat-value">{{ stats.totalInscricoes }}</p>
        </div>
      </div>

      <div class="stat-card com-foto">
        <div class="stat-icon">
          <i class="bi bi-camera"></i>
        </div>
        <div class="stat-info">
          <h3>Com Foto</h3>
          <p class="stat-value">{{ stats.inscricoesComFoto }}</p>
        </div>
      </div>

      <div class="stat-card pagas">
        <div class="stat-icon">
          <i class="bi bi-check-circle"></i>
        </div>
        <div class="stat-info">
          <h3>Pagas</h3>
          <p class="stat-value">{{ stats.inscricoesPagas }}</p>
        </div>
      </div>

      <div class="stat-card pendentes">
        <div class="stat-icon">
          <i class="bi bi-hourglass-split"></i>
        </div>
        <div class="stat-info">
          <h3>Pendentes</h3>
          <p class="stat-value">{{ stats.inscricoesPendentes }}</p>
        </div>
      </div>
    </div>

    <!-- Modal Criar/Editar -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>{{ form.id ? 'Editar Inscrição' : 'Nova Inscrição' }}</h4>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAndClose">
            <div class="form-row">
              <div class="form-group">
                <label>Nome Completo</label>
                <input v-model="form.nome" placeholder="Nome completo" required />
              </div>
              <div class="form-group">
                <label>CPF</label>
                <input v-model="form.cpf" placeholder="000.000.000-00" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Categoria</label>
                <select v-model="form.categoria" required>
                  <option value="">Selecione</option>
                  <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.descricao }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Lote</label>
                <select v-model="form.lote" required>
                  <option value="">Selecione</option>
                  <option v-for="l in lotes" :key="l.id" :value="l.id">{{ l.descricao }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Nº Parcelas</label>
                <input v-model.number="form.numero_parcelas" type="number" min="1" placeholder="1" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>CEP</label>
                <input v-model="form.cep" placeholder="00000-000" @input="buscarCep" :class="{ 'loading': buscandoCep }" />
              </div>
              <div class="form-group">
                <label>Município</label>
                <input v-model="form.municipio" placeholder="Município" />
              </div>
              <div class="form-group">
                <label>UF</label>
                <input v-model="form.uf" placeholder="UF" maxlength="2" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Desconto</label>
                <input v-model.number="form.desconto" type="number" step="0.01" min="0" placeholder="0.00" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full-width">
                <label>Foto do Participante</label>
                <input type="file" @change="handleFileChange" accept="image/*" class="file-input" />
                <div v-if="photoPreview" class="photo-preview">
                  <img :src="photoPreview" alt="Preview" />
                  <button type="button" @click="clearPhoto" class="btn-clear-photo">Remover</button>
                </div>
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

    <!-- Modal Visualizar Detalhes -->
    <div v-if="showViewModal" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content view-modal" @click.stop>
        <div class="modal-header">
          <h4>Detalhes da Inscrição</h4>
          <button @click="closeViewModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="view-content">
            <div v-if="viewingInscricao.foto_url" class="photo-section">
              <img :src="viewingInscricao.foto_url" alt="Foto do participante" class="inscricao-photo" />
            </div>
            <div class="details-grid">
              <div class="detail-item">
                <label>Nome Completo:</label>
                <span>{{ viewingInscricao.nome }}</span>
              </div>
              <div class="detail-item">
                <label>CPF:</label>
                <span>{{ viewingInscricao.cpf || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Categoria:</label>
                <span>{{ viewingInscricao.categoria_descricao || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>CEP:</label>
                <span>{{ viewingInscricao.cep || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Município:</label>
                <span>{{ viewingInscricao.municipio || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>UF:</label>
                <span>{{ viewingInscricao.uf || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Número de Parcelas:</label>
                <span>{{ viewingInscricao.numero_parcelas || 1 }}</span>
              </div>
              <div class="detail-item">
                <label>Desconto:</label>
                <span>R$ {{ formatMoney(viewingInscricao.desconto || 0) }}</span>
              </div>
              <div class="detail-item">
                <label>Valor Total:</label>
                <span>R$ {{ formatMoney(viewingInscricao.valor_total || 0) }}</span>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="editFromViewModal" class="btn-save">Editar</button>
            <button @click="closeViewModal" class="btn-cancel">Fechar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista -->
    <div class="list-section">
      <div class="header-actions">
        <h3>Inscrições Cadastradas</h3>
        <button @click="createNew" class="btn-new">
          <i class="bi bi-plus-lg"></i> Nova Inscrição
        </button>
      </div>
      <div class="search-section">
        <div class="search-box">
          <i class="bi bi-search"></i>
          <input 
            v-model="searchTerm" 
            @input="debounceSearch" 
            type="text" 
            placeholder="Pesquisar por nome..." 
            class="search-input"
          />
        </div>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Categoria</th>
              <th>Parcelas</th>
              <th>Valor Total</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="insc in inscricoes.results || inscricoes" :key="insc.id">
              <td><strong>{{ insc.nome }}</strong></td>
              <td>{{ insc.cpf || '-' }}</td>
              <td>{{ insc.categoria_descricao || '-' }}</td>
              <td>{{ insc.numero_parcelas || 1 }}</td>
              <td>{{ insc.valor_total ? 'R$ ' + formatMoney(insc.valor_total) : 'R$ 0,00' }}</td>
              <td class="text-center">
                <button @click="viewDetails(insc)" class="btn-view" title="Visualizar"><i class="bi bi-eye"></i></button>
                <button @click="openPayment(insc)" class="btn-pay" title="Pagar"><i class="bi bi-credit-card"></i></button>
                <button @click="edit(insc)" class="btn-edit" title="Editar"><i class="bi bi-pencil-square"></i></button>
                <button @click="remove(insc)" class="btn-delete" title="Excluir"><i class="bi bi-trash3-fill"></i></button>
              </td>
            </tr>
            <tr v-if="(!inscricoes.results || inscricoes.results.length === 0) && (!inscricoes || inscricoes.length === 0)">
              <td colspan="6" class="text-center empty-state"><i class="bi bi-inbox"></i><p>Nenhuma inscrição encontrada</p></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Pagamento -->
    <PaymentModal 
      :show="showPaymentModal" 
      :inscricao="selectedInscricao"
      @close="closePaymentModal"
      @success="onPaymentSuccess"
    />
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import api from '../services/api'
import PaymentModal from '../components/PaymentModal.vue'

const inscricoes = reactive({})
const categorias = reactive({})
const lotes = reactive({})
const form = reactive({ id: null, nome: '', cpf: '', categoria: null, lote: null, cep: '', municipio: '', uf: '', desconto: 0, numero_parcelas: 1 })

const stats = reactive({
  totalInscricoes: 0,
  inscricoesComFoto: 0,
  inscricoesPagas: 0,
  inscricoesPendentes: 0
})
const showModal = ref(false)
const showViewModal = ref(false)
const showPaymentModal = ref(false)
const selectedInscricao = ref(null)
const viewingInscricao = reactive({})
const photoFile = ref(null)
const photoPreview = ref(null)
const buscandoCep = ref(false)
const searchTerm = ref('')
let searchTimeout = null

async function fetchInscricoes(url = null, search = '') {
  let endpoint = url || '/inscricoes/'
  if (search) {
    endpoint += endpoint.includes('?') ? `&search=${search}` : `?search=${search}`
  }
  const { data } = await api.get(endpoint)
  Object.assign(inscricoes, data)
  updateStats()
}

function updateStats() {
  const inscricoesList = inscricoes.results || inscricoes || []
  stats.totalInscricoes = inscricoesList.length
  stats.inscricoesComFoto = inscricoesList.filter(i => i.foto_url).length
  // Nota: A verificação de pagas/pendentes precisa de dados dos pagamentos, simplificando aqui
  stats.inscricoesPagas = 0
  stats.inscricoesPendentes = 0
}

function debounceSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchInscricoes(null, searchTerm.value)
  }, 500)
}

async function fetchCategorias() {
  const { data } = await api.get('/categorias/')
  Object.assign(categorias, Array.isArray(data) ? data : (data.results || []))
}

async function fetchLotes() {
  const { data } = await api.get('/lotes/')
  Object.assign(lotes, Array.isArray(data) ? data : (data.results || []))
}

function createNew() { Object.assign(form, { id: null, nome: '', cpf: '', categoria: null, lote: null, cep: '', municipio: '', uf: '', desconto: 0, numero_parcelas: 1 }); photoPreview.value = null; photoFile.value = null; showModal.value = true }
function edit(i) { Object.assign(form, i); photoPreview.value = i.foto_url || null; showModal.value = true }
function reset() { Object.assign(form, { id: null, nome: '', cpf: '', categoria: null, lote: null, cep: '', municipio: '', uf: '', desconto: 0, numero_parcelas: 1 }); photoPreview.value = null; photoFile.value = null }
function closeModal() { reset(); showModal.value = false }

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    photoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => { photoPreview.value = e.target.result }
    reader.readAsDataURL(file)
  }
}

function clearPhoto() { photoPreview.value = null; photoFile.value = null }

function viewDetails(insc) { Object.assign(viewingInscricao, insc); showViewModal.value = true }
function closeViewModal() { showViewModal.value = false }
function editFromViewModal() { 
  showViewModal.value = false
  setTimeout(() => {
    Object.assign(form, viewingInscricao)
    photoPreview.value = viewingInscricao.foto_url || null
    showModal.value = true
  }, 100)
}

async function buscarCep(event) {
  const cep = event.target.value.replace(/\D/g, '')
  if (cep.length === 8) {
    buscandoCep.value = true
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()
      if (!data.erro) {
        form.municipio = data.localidade || ''
        form.uf = data.uf || ''
        form.cep = cep.replace(/(\d{5})(\d{3})/, '$1-$2')
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    } finally {
      buscandoCep.value = false
    }
  }
}

function openPayment(insc) {
  selectedInscricao.value = insc
  showPaymentModal.value = true
}

function closePaymentModal() {
  showPaymentModal.value = false
  selectedInscricao.value = null
}

async function onPaymentSuccess(data) {
  alert('Pagamento realizado com sucesso!')
  await fetchInscricoes()
  closePaymentModal()
}

async function save() {
  const formData = new FormData()
  formData.append('nome', form.nome)
  if (form.cpf) formData.append('cpf', form.cpf)
  formData.append('categoria', form.categoria)
  formData.append('lote', form.lote)
  if (form.cep) formData.append('cep', form.cep)
  if (form.municipio) formData.append('municipio', form.municipio)
  if (form.uf) formData.append('uf', form.uf)
  formData.append('desconto', form.desconto || 0)
  formData.append('numero_parcelas', form.numero_parcelas || 1)
  
  if (photoFile.value) {
    formData.append('foto', photoFile.value)
  }
  
  if (form.id) {
    await api.patch(`/inscricoes/${form.id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  } else {
    await api.post('/inscricoes/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
  await fetchInscricoes()
}

async function saveAndClose() { await save(); closeModal() }

async function remove(i) {
  if (confirm(`Excluir inscrição de "${i.nome}"?`)) {
    await api.delete(`/inscricoes/${i.id}/`)
    await fetchInscricoes()
  }
}

function formatMoney(value) { return parseFloat(value || 0).toFixed(2) }

onMounted(async () => { await Promise.all([fetchInscricoes(), fetchCategorias(), fetchLotes()]) })
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
.stat-card.com-foto .stat-icon { background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%); color: #0c5460; }
.stat-card.pagas .stat-icon { background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); color: #155724; }
.stat-card.pendentes .stat-icon { background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); color: #856404; }
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

.search-section { padding: 20px 32px; border-bottom: 2px solid #e1e5e9; background: #f8f9fa; }
.search-box { position: relative; max-width: 400px; }
.search-box i { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #6c757d; font-size: 1.2rem; }
.search-input { width: 100%; padding: 12px 16px 12px 48px; border: 2px solid #ddd; border-radius: 12px; font-size: 1rem; transition: all 0.3s; }
.search-input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1); }

.table-container { overflow-x: auto; }

table { width: 100%; border-collapse: collapse; }
thead { background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); }
th { padding: 16px 20px; text-align: left; font-weight: 600; color: #2c3e50; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.5px; }
td { padding: 16px 20px; border-bottom: 1px solid #e1e5e9; color: #4a5568; }
.text-center { text-align: center; }
tbody tr:hover { background: #f8f9fa; }
.btn-view, .btn-pay, .btn-edit, .btn-delete { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; margin: 0 4px; transition: all 0.2s; }
.btn-view { background: #e8f5e9; color: #2e7d32; }
.btn-view:hover { background: #c8e6c9; }
.btn-pay { background: #d4edda; color: #155724; }
.btn-pay:hover { background: #c3e6cb; }
.btn-edit { background: #fef5e7; color: #d68910; }
.btn-edit:hover { background: #fdebd0; }
.btn-delete { background: #fee; color: #c0392b; }
.btn-delete:hover { background: #fdd; }
.empty-state { padding: 60px 20px; color: #a0aec0; }
.empty-state i { font-size: 3rem; margin-bottom: 16px; display: block; }
.empty-state p { font-size: 1rem; font-weight: 500; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 40px 20px; }
.modal-content { background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 20px; max-width: 900px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
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
input.loading { background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%236679ea" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"><animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite"/></path></svg>'); background-repeat: no-repeat; background-position: right 8px center; background-size: 20px; }
.file-input { padding: 8px; }

.photo-preview { margin-top: 16px; display: flex; align-items: center; gap: 16px; }
.photo-preview img { width: 120px; height: 120px; object-fit: cover; border-radius: 12px; border: 2px solid #ddd; }
.btn-clear-photo { background: #fee; color: #c0392b; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; }

.modal-actions { display: flex; gap: 16px; margin-top: 20px; justify-content: flex-end; }
.modal-actions .btn-save { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 14px 32px; font-size: 1rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(102,126,234,0.4); transition: all 0.3s; }
.modal-actions .btn-save:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.5); }
.modal-actions .btn-cancel { background: rgba(245,101,101,0.1); color: #f56565; border: 2px solid #f56565; padding: 14px 32px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.3s; }
.modal-actions .btn-cancel:hover { background: #f56565; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,101,101,0.4); }

/* Modal de Visualização */
.view-content { display: grid; gap: 24px; }
.view-modal { max-width: 700px; }
.photo-section { text-align: center; }
.inscricao-photo { width: 200px; height: 200px; object-fit: cover; border-radius: 16px; border: 4px solid #667eea; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3); }

.details-grid { display: grid; gap: 16px; }
.detail-item { display: grid; grid-template-columns: 180px 1fr; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; }
.detail-item label { font-weight: 600; color: #667eea; }
.detail-item span { color: #2c3e50; font-size: 1rem; }
</style>
