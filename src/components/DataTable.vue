<template>
  <div class="data-table-container">
    <div class="table-header">
      <h2>{{ title }}</h2>
      <div class="table-actions">
        <input v-model="searchQuery" @input="$emit('search', searchQuery)" placeholder="Buscar..." class="search-input" />
        <button @click="$emit('create')" class="btn-primary">
          <i class="bi bi-plus-circle"></i> Novo
        </button>
      </div>
    </div>
    
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
            <th class="actions">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in data" :key="row.id">
            <td v-for="col in columns" :key="col.key">
              <slot :name="col.key" :row="row">{{ row[col.key] }}</slot>
            </td>
            <td class="actions">
              <div class="action-buttons">
                <button @click="$emit('edit', row)" class="btn-edit" title="Editar">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button @click="$emit('delete', row)" class="btn-delete" title="Excluir">
                  <i class="bi bi-trash3-fill"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="data.length === 0">
            <td :colspan="columns.length + 1" class="empty-state">
              Nenhum registro encontrado
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="pagination && (pagination.next || pagination.previous)" class="pagination">
      <button :disabled="!pagination.previous" @click="$emit('prev')" class="btn-page">Anterior</button>
      <button :disabled="!pagination.next" @click="$emit('next')" class="btn-page">Próxima</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: String,
  columns: Array,
  data: Array,
  pagination: Object
})

const searchQuery = ref('')
</script>

<style scoped>
.data-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}
.table-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}
.table-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 250px;
}
.btn-primary {
  background: #0d4e8f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #093d70;
}
.table-wrapper {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table thead {
  background: #f8f9fa;
}
.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #dee2e6;
}
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.data-table tbody tr:hover {
  background: #f8f9fa;
}
.data-table .actions {
  width: 120px;
  text-align: center;
}
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.btn-edit {
  background: #d8890a;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-edit:hover {
  background: #e4ae57;
}
.btn-delete {
  background: #8a0e0e;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-delete:hover {
  background: #bb0e0e;
}
.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
}
.pagination {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #dee2e6;
}
.btn-page {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-page:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #0d4e8f;
}
.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  .search-input {
    width: 100%;
  }
}
</style>

