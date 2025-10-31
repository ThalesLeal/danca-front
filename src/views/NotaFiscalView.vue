<template>
  <div class="invoice-page">
    <div class="invoice" id="invoice">
      <header class="invoice-header">
        <img src="/logo.png" alt="Logo" class="logo" />
        <div class="company">
          <h1>Sistema Dança</h1>
          <p>Nota Fiscal (não oficial)</p>
        </div>
      </header>

      <section class="meta">
        <div>
          <h3>Pedido</h3>
          <p><strong>#{{ nota?.pedido?.id }}</strong></p>
          <p>{{ formatDate(nota?.pedido?.data_pedido) }}</p>
        </div>
        <div>
          <h3>Cliente</h3>
          <p>{{ nota?.pedido?.cliente }}</p>
          <p>{{ nota?.pedido?.cidade }}</p>
        </div>
        <div>
          <h3>Status</h3>
          <span :class="['status', nota?.pedido?.status]">{{ toDisplay(nota?.pedido?.status) }}</span>
        </div>
      </section>

      <section class="items">
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Cor</th>
              <th>Tam.</th>
              <th class="right">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ nota?.pedido?.camisa_descricao }}</td>
              <td>{{ nota?.pedido?.cor }}</td>
              <td>{{ nota?.pedido?.tamanho }}</td>
              <td class="right">R$ {{ money(nota?.pedido?.valor) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="payment" v-if="nota?.pagamento">
        <h3>Pagamento</h3>
        <ul>
          <li><strong>Método:</strong> {{ toDisplay(nota.pagamento.metodo) }}</li>
          <li><strong>Gateway:</strong> {{ toDisplay(nota.pagamento.gateway) }}</li>
          <li><strong>Parcelas:</strong> {{ nota.pagamento.parcelas }}</li>
          <li><strong>Valor Pago:</strong> R$ {{ money(nota.pagamento.valor_pago) }}</li>
          <li><strong>Status:</strong> {{ toDisplay(nota.pagamento.status) }}</li>
          <li v-if="nota.pagamento.transaction_id"><strong>Transação:</strong> {{ nota.pagamento.transaction_id }}</li>
        </ul>
      </section>

      <footer class="invoice-footer">
        <p>Documento gerado automaticamente. Para fins de comprovação.</p>
      </footer>
    </div>

    <div class="actions no-print">
      <button @click="printInvoice"><i class="bi bi-printer"></i> Imprimir / PDF</button>
      <a v-if="nota?.pagamento?.nota_url" :href="nota.pagamento.nota_url" target="_blank" class="download">
        <i class="bi bi-download"></i> Baixar DOCX
      </a>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const nota = ref(null)

async function loadNota() {
  const id = route.params.id
  const { data } = await api.get(`/pedidos/${id}/nota/`)
  nota.value = data
}

function money(v) { return parseFloat(v || 0).toFixed(2) }
function formatDate(v) { return v ? new Date(v).toLocaleDateString('pt-BR') : '-' }
function toDisplay(v) { return (v || '').toString().replace(/_/g,' ').replace(/\b\w/g, m => m.toUpperCase()) }
function printInvoice() { window.print() }

onMounted(loadNota)
</script>

<style scoped>
.invoice-page { padding: 16px; }
.invoice { background: white; max-width: 900px; margin: 0 auto; box-shadow: 0 8px 30px rgba(0,0,0,0.1); border-radius: 16px; overflow: hidden; }
.invoice-header { display: flex; align-items: center; gap: 16px; padding: 24px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
.logo { height: 56px; }
.company h1 { margin: 0; font-size: 1.5rem; }
.company p { margin: 4px 0 0 0; opacity: 0.9; }
.meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; padding: 20px 28px; background: #f8f9fa; }
.meta h3 { margin: 0 0 6px 0; color: #2d3748; font-size: 1rem; }
.status { padding: 6px 10px; border-radius: 8px; background: #edf2f7; color: #2d3748; font-weight: 600; display: inline-block; }
.status.pago { background: #d4edda; color: #155724 }
.status.pendente { background: #fff3cd; color: #856404 }
.items { padding: 0 28px 20px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; border-bottom: 1px solid #e1e5e9; text-align: left; }
.right { text-align: right; }
.payment { padding: 0 28px 28px; }
.payment h3 { margin: 16px 0; }
.payment ul { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px 16px; }
.invoice-footer { padding: 16px 28px 28px; color: #718096; font-size: 0.9rem; }
.actions { max-width: 900px; margin: 12px auto; display: flex; gap: 12px; }
.actions button, .actions .download { background: #667eea; color: white; border: none; padding: 10px 16px; border-radius: 10px; text-decoration: none; cursor: pointer; }
.actions button:hover, .actions .download:hover { filter: brightness(1.05); }

@media print {
  .no-print { display: none !important; }
  .invoice { box-shadow: none; border-radius: 0; }
}
</style>


