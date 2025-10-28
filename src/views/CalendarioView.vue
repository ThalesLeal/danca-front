<template>
  <div class="page-container">
    <h2>Calendário de Eventos</h2>

    <div class="calendar-controls">
      <div class="month-navigation">
        <button @click="previousMonth" class="nav-btn">
          <i class="bi bi-chevron-left"></i>
        </button>
        <h3>{{ currentMonthYear }}</h3>
        <button @click="nextMonth" class="nav-btn">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
      <div class="legend">
        <span class="legend-item"><span class="legend-color pendente"></span> Pendente</span>
        <span class="legend-item"><span class="legend-color confirmado"></span> Confirmado</span>
        <span class="legend-item"><span class="legend-color realizado"></span> Realizado</span>
      </div>
    </div>

    <div class="calendar-container">
      <div class="calendar-grid">
        <div class="calendar-header">
          <div v-for="day in daysOfWeek" :key="day" class="weekday">{{ day }}</div>
        </div>
        <div class="calendar-body">
          <div v-for="(day, index) in calendarDays" :key="index" 
               :class="['calendar-day', { 'other-month': !day.inMonth, 'has-event': day.hasEvent }]">
            <span class="day-number">{{ day.day }}</span>
            <div v-if="day.hasEvent" class="events-list">
              <div v-for="event in day.events" :key="event.id" 
                   :class="['event-dot', `status-${event.status}`]"
                   :title="event.descricao">
                <span class="event-name">{{ event.descricao }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes do Evento -->
    <div v-if="selectedDay && selectedDay.hasEvent" class="modal-overlay" @click="selectedDay = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>Eventos do Dia {{ selectedDay.day }}</h4>
          <button @click="selectedDay = null" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-for="event in selectedDay.events" :key="event.id" class="event-card-detailed">
            <h5>{{ event.descricao }}</h5>
            <p><strong>Tipo:</strong> {{ event.tipo_descricao || 'Não informado' }}</p>
            <p><strong>Data:</strong> {{ formatDate(event.data) }}</p>
            <p><strong>Valor:</strong> {{ event.valor_unitario ? 'R$ ' + formatMoney(event.valor_unitario) : 'Gratuito' }}</p>
            <p><strong>Inscritos:</strong> {{ event.contador_inscricoes || 0 }}</p>
            <p><strong>Status:</strong> 
              <span :class="['status-badge', getStatusClass(event.status)]">
                {{ getStatusDisplay(event.status) }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../services/api'

const eventos = ref([])
const currentDate = ref(new Date())
const selectedDay = ref(null)

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
})

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  
  const days = []
  
  // Dias do mês anterior
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      inMonth: false,
      hasEvent: false,
      events: []
    })
  }
  
  // Dias do mês atual
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayEvents = eventos.value.filter(evento => {
      if (!evento.data) return false
      const eventDate = new Date(evento.data)
      return eventDate.toISOString().startsWith(dateStr)
    })
    
    days.push({
      day,
      date: new Date(year, month, day),
      inMonth: true,
      hasEvent: dayEvents.length > 0,
      events: dayEvents
    })
  }
  
  // Dias do próximo mês
  const totalDays = days.length
  const remainingDays = 42 - totalDays // 6 semanas x 7 dias
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      day,
      inMonth: false,
      hasEvent: false,
      events: []
    })
  }
  
  return days
})

async function loadEventos() {
  try {
    const { data } = await api.get('/eventos/')
    eventos.value = data.results || data
  } catch (error) {
    console.error('Erro ao carregar eventos:', error)
  }
}

function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
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

function formatMoney(value) {
  return parseFloat(value || 0).toFixed(2)
}

function formatDate(value) {
  if (!value) return 'Não informado'
  const date = new Date(value)
  return date.toLocaleDateString('pt-BR')
}

onMounted(loadEventos)
</script>

<style scoped>
.page-container { padding: 0; }
h2 { font-size: 1.75rem; color: #2c3e50; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 3px solid #667eea; }

.calendar-controls { 
  background: white; 
  border-radius: 16px; 
  box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
  padding: 24px 32px; 
  margin-bottom: 24px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.month-navigation { 
  display: flex; 
  align-items: center; 
  gap: 16px; 
}
.month-navigation h3 { 
  margin: 0; 
  color: #2c3e50; 
  font-size: 1.25rem; 
  text-transform: capitalize; 
  min-width: 200px; 
  text-align: center; 
}
.nav-btn { 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
  color: white; 
  border: none; 
  border-radius: 50%; 
  width: 40px; 
  height: 40px; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  transition: all 0.3s; 
}
.nav-btn:hover { transform: scale(1.1); }

.legend { display: flex; gap: 16px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: #4a5568; }
.legend-color { 
  width: 12px; 
  height: 12px; 
  border-radius: 50%; 
}
.legend-color.pendente { background: #fff3cd; }
.legend-color.confirmado { background: #d4edda; }
.legend-color.realizado { background: #d1ecf1; }

.calendar-container { 
  background: white; 
  border-radius: 16px; 
  box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
  padding: 24px; 
  overflow: hidden; 
}

.calendar-grid { 
  display: grid; 
  grid-template-columns: repeat(7, 1fr); 
  gap: 0; 
}
.calendar-header { 
  display: contents; 
}
.weekday { 
  padding: 12px 8px; 
  text-align: center; 
  font-weight: 600; 
  color: #2c3e50; 
  font-size: 0.875rem; 
  border-bottom: 2px solid #e1e5e9; 
  background: #f8f9fa; 
}

.calendar-body { 
  display: contents; 
}
.calendar-day { 
  min-height: 80px; 
  padding: 8px; 
  border: 1px solid #e1e5e9; 
  position: relative; 
  background: white; 
  transition: all 0.2s; 
}
.calendar-day:hover { 
  background: #f8f9fa; 
  cursor: pointer; 
}
.calendar-day.other-month { 
  opacity: 0.3; 
}
.calendar-day.has-event { 
  background: #e6fffa; 
}
.day-number { 
  font-weight: 600; 
  color: #2d3748; 
  font-size: 0.9rem; 
}

.events-list { 
  margin-top: 4px; 
  display: flex; 
  flex-direction: column; 
  gap: 2px; 
}
.event-dot { 
  padding: 2px 6px; 
  border-radius: 4px; 
  font-size: 0.7rem; 
  font-weight: 600; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  cursor: pointer; 
}
.event-dot.status-pendente { background: #fff3cd; color: #856404; }
.event-dot.status-confirmado { background: #d4edda; color: #155724; }
.event-dot.status-cancelado { background: #f8d7da; color: #721c24; }
.event-dot.status-realizado { background: #d1ecf1; color: #0c5460; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 40px 20px; }
.modal-content { background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 20px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 28px 32px; border-bottom: 2px solid #e1e5e9; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px 20px 0 0; position: sticky; top: 0; z-index: 10; }
.modal-header h4 { margin: 0; color: white; font-size: 1.5rem; font-weight: 600; }
.close-btn { background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); font-size: 1.5rem; color: #fff; cursor: pointer; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; transition: all 0.3s; }
.close-btn:hover { background: rgba(255,255,255,0.3); transform: rotate(90deg); }
.modal-body { padding: 32px; }
.event-card-detailed { 
  background: #f8f9fa; 
  padding: 16px; 
  border-radius: 12px; 
  margin-bottom: 16px; 
  border: 1px solid #e1e5e9; 
}
.event-card-detailed h5 { 
  margin: 0 0 12px 0; 
  color: #2d3748; 
  font-size: 1.1rem; 
}
.event-card-detailed p { 
  margin: 4px 0; 
  color: #4a5568; 
  font-size: 0.9rem; 
}
.status-badge { 
  padding: 4px 12px; 
  border-radius: 8px; 
  font-size: 0.8rem; 
  font-weight: 600; 
}
.status-pendente { background: #fff3cd; color: #856404; }
.status-confirmado { background: #d4edda; color: #155724; }
.status-cancelado { background: #f8d7da; color: #721c24; }
.status-realizado { background: #d1ecf1; color: #0c5460; }

@media (max-width: 768px) {
  .calendar-controls { flex-direction: column; gap: 16px; align-items: stretch; }
  .legend { flex-wrap: wrap; }
  .calendar-day { min-height: 60px; font-size: 0.8rem; }
}
</style>
