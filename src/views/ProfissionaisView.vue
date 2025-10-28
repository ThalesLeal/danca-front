<template>
  <div class="page-container">
    <h2>Profissionais</h2>

    <!-- Modal Criar/Editar -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>{{ form.id ? 'Editar Profissional' : 'Novo Profissional' }}</h4>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAndClose">
            <div class="form-row">
              <div class="form-group">
                <label>Nome Completo</label>
                <input v-model="form.nome" placeholder="Nome do profissional" required />
              </div>
              <div class="form-group">
                <label>CPF</label>
                <input v-model="form.cpf" placeholder="000.000.000-00" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Função</label>
                <select v-model="form.funcao" required>
                  <option value="">Selecione</option>
                  <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.descricao }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Valor Hora/Aula</label>
                <input v-model.number="form.valor_hora_aula" type="number" step="0.01" min="0" />
              </div>
              <div class="form-group">
                <label>Qt. Aulas</label>
                <input v-model.number="form.qt_aulas" type="number" min="0" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Local Partida</label>
                <input v-model="form.local_partida" placeholder="Local de partida" />
              </div>
              <div class="form-group">
                <label>Local Volta</label>
                <input v-model="form.local_volta" placeholder="Local de volta" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full-width">
                <label>Foto do Profissional</label>
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
          <h4>Detalhes do Profissional</h4>
          <button @click="closeViewModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="view-content">
            <div v-if="viewingProfessional.foto_url" class="photo-section">
              <img :src="viewingProfessional.foto_url" alt="Foto do profissional" class="professional-photo" />
            </div>
            <div class="details-grid">
              <div class="detail-item">
                <label>Nome Completo:</label>
                <span>{{ viewingProfessional.nome }}</span>
              </div>
              <div class="detail-item">
                <label>CPF:</label>
                <span>{{ viewingProfessional.cpf || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Função:</label>
                <span>{{ viewingProfessional.funcao_descricao || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Valor Hora/Aula:</label>
                <span>{{ viewingProfessional.valor_hora_aula ? 'R$ ' + formatMoney(viewingProfessional.valor_hora_aula) : '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Quantidade de Aulas:</label>
                <span>{{ viewingProfessional.qt_aulas || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Local de Partida:</label>
                <span>{{ viewingProfessional.local_partida || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Local de Volta:</label>
                <span>{{ viewingProfessional.local_volta || '-' }}</span>
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
        <h3>Profissionais Cadastrados</h3>
        <button @click="createNew" class="btn-new">
          <i class="bi bi-plus-lg"></i> Novo Profissional
        </button>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Função</th>
              <th>Valor Hora</th>
              <th>Aulas</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prof in profissionais.results || profissionais" :key="prof.id">
              <td><strong>{{ prof.nome }}</strong></td>
              <td>{{ prof.cpf || '-' }}</td>
              <td>{{ prof.funcao_descricao || '-' }}</td>
              <td>{{ prof.valor_hora_aula ? 'R$ ' + formatMoney(prof.valor_hora_aula) : '-' }}</td>
              <td>{{ prof.qt_aulas || '-' }}</td>
              <td class="text-center">
                <button @click="viewDetails(prof)" class="btn-view" title="Visualizar"><i class="bi bi-eye"></i></button>
                <button @click="edit(prof)" class="btn-edit" title="Editar"><i class="bi bi-pencil-square"></i></button>
                <button @click="remove(prof)" class="btn-delete" title="Excluir"><i class="bi bi-trash3-fill"></i></button>
              </td>
            </tr>
            <tr v-if="(!profissionais.results || profissionais.results.length === 0) && (!profissionais || profissionais.length === 0)">
              <td colspan="6" class="text-center empty-state"><i class="bi bi-inbox"></i><p>Nenhum profissional encontrado</p></td>
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

const profissionais = reactive({})
const categorias = reactive({})
const form = reactive({ id: null, nome: '', cpf: '', funcao: null, valor_hora_aula: 0, qt_aulas: 0, local_partida: '', local_volta: '' })
const showModal = ref(false)
const showViewModal = ref(false)
const viewingProfessional = reactive({})
const photoFile = ref(null)
const photoPreview = ref(null)

async function fetchProfissionais(url = null) {
  const { data } = await api.get(url || '/profissionais/')
  Object.assign(profissionais, data)
}

async function fetchCategorias() {
  const { data } = await api.get('/categorias/')
  Object.assign(categorias, Array.isArray(data) ? data : (data.results || []))
}

function createNew() { Object.assign(form, { id: null, nome: '', cpf: '', funcao: null, valor_hora_aula: 0, qt_aulas: 0, local_partida: '', local_volta: '' }); photoPreview.value = null; photoFile.value = null; showModal.value = true }
function edit(p) { Object.assign(form, p); photoPreview.value = p.foto_url || null; showModal.value = true }
function reset() { Object.assign(form, { id: null, nome: '', cpf: '', funcao: null, valor_hora_aula: 0, qt_aulas: 0, local_partida: '', local_volta: '' }); photoPreview.value = null; photoFile.value = null }
function closeModal() { reset(); showModal.value = false }

function viewDetails(prof) { Object.assign(viewingProfessional, prof); showViewModal.value = true }
function closeViewModal() { showViewModal.value = false }
function editFromViewModal() { 
  showViewModal.value = false
  setTimeout(() => {
    Object.assign(form, viewingProfessional)
    photoPreview.value = viewingProfessional.foto_url || null
    showModal.value = true
  }, 100)
}

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

async function save() {
  const formData = new FormData()
  formData.append('nome', form.nome)
  if (form.cpf) formData.append('cpf', form.cpf)
  formData.append('funcao', form.funcao)
  if (form.valor_hora_aula) formData.append('valor_hora_aula', form.valor_hora_aula)
  if (form.qt_aulas) formData.append('qt_aulas', form.qt_aulas)
  if (form.local_partida) formData.append('local_partida', form.local_partida)
  if (form.local_volta) formData.append('local_volta', form.local_volta)
  
  if (photoFile.value) {
    formData.append('foto', photoFile.value)
  }
  
  if (form.id) {
    await api.patch(`/profissionais/${form.id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  } else {
    await api.post('/profissionais/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
  await fetchProfissionais()
}

async function saveAndClose() { await save(); closeModal() }

async function remove(p) {
  if (confirm(`Excluir profissional "${p.nome}"?`)) {
    await api.delete(`/profissionais/${p.id}/`)
    await fetchProfissionais()
  }
}

function formatMoney(value) { return parseFloat(value || 0).toFixed(2) }

onMounted(async () => { await Promise.all([fetchProfissionais(), fetchCategorias()]) })
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
.btn-view, .btn-edit, .btn-delete { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; margin: 0 4px; transition: all 0.2s; }
.btn-view { background: #e8f5e9; color: #2e7d32; }
.btn-view:hover { background: #c8e6c9; }
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
.file-input { padding: 8px; }

.photo-preview { margin-top: 16px; display: flex; align-items: center; gap: 16px; }
.photo-preview img { width: 120px; height: 120px; object-fit: cover; border-radius: 12px; border: 2px solid #ddd; }
.btn-clear-photo { background: #fee; color: #c0392b; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; }

.view-content { display: grid; gap: 24px; }
.view-modal { max-width: 700px; }
.photo-section { text-align: center; }
.professional-photo { width: 200px; height: 200px; object-fit: cover; border-radius: 16px; border: 4px solid #667eea; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3); }

.details-grid { display: grid; gap: 16px; }
.detail-item { display: grid; grid-template-columns: 180px 1fr; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; }
.detail-item label { font-weight: 600; color: #667eea; }
.detail-item span { color: #2c3e50; font-size: 1rem; }
.modal-actions { display: flex; gap: 16px; margin-top: 20px; justify-content: flex-end; }
.modal-actions .btn-save { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 14px 32px; font-size: 1rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(102,126,234,0.4); transition: all 0.3s; }
.modal-actions .btn-save:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.5); }
.modal-actions .btn-cancel { background: rgba(245,101,101,0.1); color: #f56565; border: 2px solid #f56565; padding: 14px 32px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.3s; }
.modal-actions .btn-cancel:hover { background: #f56565; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,101,101,0.4); }
</style>
