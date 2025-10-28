<template>
  <div class="page-container">
    <h2>Tipos de Evento</h2>

    <!-- Modal de Criação/Edição -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>{{ form.id ? 'Editar Tipo de Evento' : 'Novo Tipo de Evento' }}</h4>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAndClose">
            <div class="form-group">
              <label>Descrição</label>
              <input v-model="form.descricao" placeholder="Descrição do tipo de evento" required />
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
        <h3>Tipos de Evento Cadastrados</h3>
        <button @click="createNew" class="btn-new">
          <i class="bi bi-plus-lg"></i> Novo Tipo
        </button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Descrição</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tipo in tipos.results || tipos" :key="tipo.id">
              <td>{{ tipo.id }}</td>
              <td><strong>{{ tipo.descricao }}</strong></td>
              <td class="text-center">
                <button @click="edit(tipo)" class="btn-edit" title="Editar">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button @click="remove(tipo)" class="btn-delete" title="Excluir">
                  <i class="bi bi-trash3-fill"></i>
                </button>
              </td>
            </tr>
            <tr v-if="(!tipos.results || tipos.results.length === 0) && (!tipos || tipos.length === 0)">
              <td colspan="3" class="text-center empty-state">
                <i class="bi bi-inbox"></i>
                <p>Nenhum tipo de evento encontrado</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="tipos.next || tipos.previous" class="pagination">
        <button :disabled="!tipos.previous" @click="go(tipos.previous)" class="btn-page">
          <i class="bi bi-chevron-left"></i> Anterior
        </button>
        <button :disabled="!tipos.next" @click="go(tipos.next)" class="btn-page">
          Próxima <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import api from '../services/api'

const tipos = reactive({})
const form = reactive({ id: null, descricao: '' })
const showModal = ref(false)

async function fetchTipos(url = null) {
  const { data } = await api.get(url || '/tipo-eventos/')
  Object.assign(tipos, data)
}

function edit(t) {
  Object.assign(form, t)
  showModal.value = true
}

function createNew() {
  Object.assign(form, { id: null, descricao: '' })
  showModal.value = true
}

function reset() { Object.assign(form, { id: null, descricao: '' }) }
function closeModal() { reset(); showModal.value = false }

async function save() {
  if (form.id) {
    await api.put(`/tipo-eventos/${form.id}/`, form)
  } else {
    await api.post('/tipo-eventos/', form)
  }
  await fetchTipos()
}

async function saveAndClose() {
  await save()
  closeModal()
}

async function remove(t) {
  if (confirm(`Excluir tipo de evento "${t.descricao}"?`)) {
    await api.delete(`/tipo-eventos/${t.id}/`)
    await fetchTipos()
  }
}

async function go(url) {
  if (url) await fetchTipos(url.replace(import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', ''))
}

onMounted(fetchTipos)
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

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 40px 20px; }
.modal-content { background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 20px; max-width: 600px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 28px 32px; border-bottom: 2px solid #e1e5e9; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px 20px 0 0; }
.modal-header h4 { margin: 0; color: white; font-size: 1.5rem; font-weight: 600; }
.close-btn { background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); font-size: 1.5rem; color: #fff; cursor: pointer; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; transition: all 0.3s; }
.close-btn:hover { background: rgba(255,255,255,0.3); transform: rotate(90deg); }
.modal-body { padding: 32px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 24px; }
label { font-weight: 600; color: #2c3e50; font-size: 0.9rem; }
input { padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
.modal-actions { display: flex; gap: 16px; margin-top: 20px; justify-content: flex-end; }
.modal-actions .btn-save { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 14px 32px; font-size: 1rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s; }
.modal-actions .btn-save:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5); }
.modal-actions .btn-cancel { background: rgba(245, 101, 101, 0.1); color: #f56565; border: 2px solid #f56565; padding: 14px 32px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.3s; }
.modal-actions .btn-cancel:hover { background: #f56565; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245, 101, 101, 0.4); }
</style>
