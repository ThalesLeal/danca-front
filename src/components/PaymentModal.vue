<template>
  <div v-if="show" class="payment-modal-overlay" @click="close">
    <div class="payment-modal-content" @click.stop>
      <div class="payment-modal-header">
        <h4>{{ mode === 'pedido' ? 'Pagamento de Pedido' : 'Pagamento de Inscrição' }}</h4>
        <button @click="close" class="close-btn">&times;</button>
      </div>
      <div class="payment-modal-body">
        <div class="inscricao-info">
          <template v-if="mode === 'pedido'">
            <h5>Pedido #{{ pedido?.id }}</h5>
            <p>Valor: <strong>R$ {{ formatMoney(pedido?.valor_venda) }}</strong></p>
          </template>
          <template v-else>
            <h5>{{ inscricao.nome }}</h5>
            <p>Valor Total: <strong>R$ {{ formatMoney(inscricao.valor_total) }}</strong></p>
          </template>
        </div>

        <!-- QR Code PIX -->
        <div v-if="qrCodeBase64" class="qr-code-container">
          <h5>Escaneie o QR Code para pagar</h5>
          <img :src="'data:image/png;base64,' + qrCodeBase64" alt="QR Code PIX" class="qr-code-img" />
          <p class="qr-info">Abra o app do seu banco e escaneie o código</p>
        </div>

        <!-- Formulário de pagamento -->
        <form v-else @submit.prevent="processPayment">
          <div class="form-group">
            <label>Forma de Pagamento</label>
            <select v-model="tipoPagamento" @change="resetForm" required>
              <option value="credit_card">Cartão de Crédito</option>
              <option value="pix">PIX</option>
            </select>
          </div>

          <div class="form-group">
            <label>Gateway de Pagamento</label>
            <select v-model="gateway" required>
              <option value="pagseguro">PagSeguro</option>
              <option value="infinitepay">InfinitePay</option>
            </select>
          </div>

          <!-- Dados de Cartão de Crédito -->
          <div v-if="tipoPagamento === 'credit_card'">
            <div class="form-row">
              <div class="form-group">
                <label>Número do Cartão</label>
                <input v-model="dadosCartao.numero" placeholder="0000 0000 0000 0000" maxlength="19" required />
              </div>
              <div class="form-group">
                <label>Nome no Cartão</label>
                <input v-model="dadosCartao.nome" placeholder="NOME COMPLETO" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Validade (Mês)</label>
                <input v-model="dadosCartao.mes" placeholder="MM" maxlength="2" required />
              </div>
              <div class="form-group">
                <label>Ano</label>
                <input v-model="dadosCartao.ano" placeholder="AAAA" maxlength="4" required />
              </div>
              <div class="form-group">
                <label>CVV</label>
                <input v-model="dadosCartao.cvv" placeholder="000" maxlength="3" required />
              </div>
            </div>

            <div class="form-group">
              <label>Parcelas</label>
              <select v-model.number="dadosCartao.parcelas">
                <option :value="1">1x sem juros</option>
                <option :value="2">2x sem juros</option>
                <option :value="3">3x sem juros</option>
                <option :value="4">4x sem juros</option>
                <option :value="5">5x sem juros</option>
                <option :value="6">6x sem juros</option>
              </select>
            </div>
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>
          <div v-if="loading" class="loading-message">Processando pagamento...</div>

          <div class="modal-actions">
            <button type="submit" class="btn-pay" :disabled="loading">
              <i :class="tipoPagamento === 'pix' ? 'bi bi-qr-code' : 'bi bi-credit-card'"></i> 
              {{ tipoPagamento === 'pix' ? 'Gerar QR Code PIX' : 'Pagar' }}
            </button>
            <button type="button" @click="close" class="btn-cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import api from '../services/api'

const props = defineProps({
  show: Boolean,
  mode: { type: String, default: 'inscricao' }, // 'inscricao' | 'pedido'
  inscricao: Object,
  pedido: Object,
})

const emit = defineEmits(['close', 'success'])

const gateway = ref('pagseguro')
const tipoPagamento = ref('credit_card')
const loading = ref(false)
const error = ref('')
const qrCodeBase64 = ref('')

const dadosCartao = reactive({
  numero: '',
  nome: '',
  mes: '',
  ano: '',
  cvv: '',
  parcelas: 1
})

function close() {
  emit('close')
  error.value = ''
  qrCodeBase64.value = ''
  resetForm()
}

function resetForm() {
  Object.assign(dadosCartao, {
    numero: '',
    nome: '',
    mes: '',
    ano: '',
    cvv: '',
    parcelas: 1
  })
}

async function processPayment() {
  loading.value = true
  error.value = ''
  
  try {
    const dadosPagamento = tipoPagamento.value === 'pix' ? {} : dadosCartao
    
    const endpoint = props.mode === 'pedido' ? '/pedidos/processar/' : '/pagamentos/processar/'
    const payload = props.mode === 'pedido'
      ? { pedido_id: props.pedido.id, gateway: gateway.value, tipo_pagamento: tipoPagamento.value, dados_pagamento: dadosPagamento }
      : { inscricao_id: props.inscricao.id, gateway: gateway.value, tipo_pagamento: tipoPagamento.value, dados_pagamento: dadosPagamento }
    const response = await api.post(endpoint, payload)
    
    if (response.data.success) {
      if (response.data.qr_code_base64) {
        // Mostrar QR Code PIX
        qrCodeBase64.value = response.data.qr_code_base64
      } else {
        // Pagamento aprovado (cartão)
        emit('success', response.data)
        close()
      }
    } else {
      error.value = response.data.message || 'Erro ao processar pagamento'
    }
  } catch (err) {
    error.value = err.response?.data?.error || err.response?.data?.message || 'Erro ao processar pagamento'
  } finally {
    loading.value = false
  }
}

function formatMoney(value) {
  return parseFloat(value || 0).toFixed(2)
}
</script>

<style scoped>
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 40px 20px;
}

.payment-modal-content {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}

.payment-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  border-bottom: 2px solid #e1e5e9;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px 20px 0 0;
}

.payment-modal-header h4 {
  margin: 0;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.3);
  font-size: 1.5rem;
  color: #fff;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: rotate(90deg);
}

.payment-modal-body {
  padding: 32px;
}

.inscricao-info {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.inscricao-info h5 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.inscricao-info p {
  margin: 0;
  color: #6c757d;
}

.qr-code-container {
  text-align: center;
  padding: 24px;
}

.qr-code-img {
  max-width: 300px;
  margin: 20px auto;
  border: 4px solid #667eea;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.qr-info {
  color: #6c757d;
  margin-top: 16px;
  font-size: 0.9rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

input, select {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  background: #fee;
  color: #c0392b;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.loading-message {
  background: #e3f2fd;
  color: #1976d2;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  justify-content: flex-end;
}

.btn-pay {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 14px 32px;
  font-size: 1rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
  transition: all 0.3s;
}

.btn-pay:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.5);
}

.btn-pay:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: rgba(245,101,101,0.1);
  color: #f56565;
  border: 2px solid #f56565;
  padding: 14px 32px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: #f56565;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245,101,101,0.4);
}
</style>
