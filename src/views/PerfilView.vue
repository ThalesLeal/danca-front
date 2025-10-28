<template>
  <div class="page-container">
    <h2>Meu Perfil</h2>

    <div class="profile-container">
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-photo">
            <img v-if="user.foto_url" :src="user.foto_url" alt="Foto do usuário" />
            <div v-else class="photo-placeholder">
              <i class="bi bi-person-circle"></i>
            </div>
            <button @click="triggerFileInput" class="change-photo-btn">
              <i class="bi bi-camera"></i>
            </button>
          </div>
          <div class="profile-info">
            <h3>{{ user.first_name || user.username }}</h3>
            <p class="user-email">{{ user.email }}</p>
            <p class="user-role">{{ user.is_superuser ? 'Administrador' : 'Usuário' }}</p>
          </div>
        </div>

        <form @submit.prevent="updateProfile" class="profile-form">
          <div class="form-row">
            <div class="form-group">
              <label for="first_name">Nome</label>
              <input 
                v-model="form.first_name" 
                id="first_name"
                type="text" 
                placeholder="Seu nome"
              />
            </div>
            <div class="form-group">
              <label for="last_name">Sobrenome</label>
              <input 
                v-model="form.last_name" 
                id="last_name"
                type="text" 
                placeholder="Seu sobrenome"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input 
              v-model="form.email" 
              id="email"
              type="email" 
              placeholder="seu@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="username">Nome de usuário</label>
            <input 
              v-model="form.username" 
              id="username"
              type="text" 
              placeholder="Nome de usuário"
              required
            />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-save" :disabled="saving">
              <span v-if="saving">
                <i class="bi bi-hourglass-split"></i> Salvando...
              </span>
              <span v-else>
                <i class="bi bi-check-circle"></i> Salvar Alterações
              </span>
            </button>
            <button type="button" @click="changePasswordModal = true" class="btn-change-password">
              <i class="bi bi-key"></i> Alterar Senha
            </button>
          </div>
        </form>
      </div>

      <!-- Modal Alterar Senha -->
      <div v-if="changePasswordModal" class="modal-overlay" @click="changePasswordModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h4>Alterar Senha</h4>
            <button @click="changePasswordModal = false" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="changePassword">
              <div class="form-group">
                <label for="old_password">Senha Atual</label>
                <input 
                  v-model="passwordForm.old_password" 
                  id="old_password"
                  type="password" 
                  placeholder="Digite sua senha atual"
                  required
                />
              </div>
              <div class="form-group">
                <label for="new_password">Nova Senha</label>
                <input 
                  v-model="passwordForm.new_password" 
                  id="new_password"
                  type="password" 
                  placeholder="Digite a nova senha"
                  required
                />
              </div>
              <div class="form-group">
                <label for="confirm_password">Confirmar Nova Senha</label>
                <input 
                  v-model="passwordForm.confirm_password" 
                  id="confirm_password"
                  type="password" 
                  placeholder="Confirme a nova senha"
                  required
                />
              </div>
              <p v-if="passwordError" class="error-message">
                <i class="bi bi-exclamation-triangle"></i> {{ passwordError }}
              </p>
              <div class="modal-actions">
                <button type="submit" class="btn-save" :disabled="changingPassword">
                  <span v-if="changingPassword">
                    <i class="bi bi-hourglass-split"></i> Alterando...
                  </span>
                  <span v-else>
                    <i class="bi bi-key"></i> Alterar Senha
                  </span>
                </button>
                <button type="button" @click="changePasswordModal = false" class="btn-cancel">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Input oculto para upload de foto -->
    <input 
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      @change="handlePhotoUpload" 
      style="display: none"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../services/api'

const user = reactive({})
const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  username: ''
})
const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const saving = ref(false)
const changingPassword = ref(false)
const changePasswordModal = ref(false)
const passwordError = ref('')
const fileInput = ref(null)

async function loadUserProfile() {
  try {
    const { data } = await api.get('/auth/user/')
    Object.assign(user, data)
    Object.assign(form, {
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email || '',
      username: data.username || ''
    })
  } catch (error) {
    console.error('Erro ao carregar perfil:', error)
  }
}

async function updateProfile() {
  saving.value = true
  try {
    const { data } = await api.put('/auth/user/profile/', form)
    Object.assign(user, data)
    alert('Perfil atualizado com sucesso!')
  } catch (error) {
    alert('Erro ao atualizar perfil: ' + (error.response?.data?.detail || error.message))
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  passwordError.value = ''
  
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    passwordError.value = 'As senhas não coincidem'
    return
  }

  if (passwordForm.new_password.length < 8) {
    passwordError.value = 'A nova senha deve ter no mínimo 8 caracteres'
    return
  }

  changingPassword.value = true
  try {
    await api.post('/auth/user/change-password/', {
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password
    })
    
    alert('Senha alterada com sucesso!')
    changePasswordModal.value = false
    Object.assign(passwordForm, { old_password: '', new_password: '', confirm_password: '' })
  } catch (error) {
    passwordError.value = error.response?.data?.detail || 'Erro ao alterar senha'
  } finally {
    changingPassword.value = false
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

async function handlePhotoUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('foto', file)

  try {
    const { data } = await api.put('/auth/user/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    Object.assign(user, data)
    alert('Foto atualizada com sucesso!')
  } catch (error) {
    alert('Erro ao atualizar foto: ' + (error.response?.data?.detail || error.message))
  }
}

onMounted(loadUserProfile)
</script>

<style scoped>
.page-container { padding: 0; }
h2 { font-size: 1.75rem; color: #2c3e50; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 3px solid #667eea; }

.profile-container { max-width: 800px; margin: 0 auto; }
.profile-card { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }

.profile-header { 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
  padding: 32px; 
  color: white; 
  display: flex; 
  align-items: center; 
  gap: 24px; 
}

.profile-photo { position: relative; }
.profile-photo img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid rgba(255,255,255,0.3); }
.photo-placeholder { width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; border: 4px solid rgba(255,255,255,0.3); }
.photo-placeholder i { font-size: 4rem; color: rgba(255,255,255,0.8); }
.change-photo-btn { position: absolute; bottom: 0; right: 0; background: #48bb78; color: white; border: none; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.change-photo-btn:hover { background: #38a169; }

.profile-info h3 { font-size: 1.5rem; margin: 0 0 8px 0; }
.profile-info p { margin: 4px 0; opacity: 0.9; }
.user-role { font-weight: 600; }

.profile-form { padding: 32px; }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
label { font-weight: 600; color: #2d3748; font-size: 0.9rem; }
input { padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
input:focus { outline: none; border-color: #667eea; }

.form-actions { display: flex; gap: 16px; margin-top: 24px; }
.btn-save, .btn-change-password { padding: 14px 24px; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.3s; }
.btn-save { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
.btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-change-password { background: rgba(72, 187, 120, 0.1); color: #48bb78; border: 2px solid #48bb78; }
.btn-change-password:hover { background: #48bb78; color: white; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 40px 20px; }
.modal-content { background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 20px; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 28px 32px; border-bottom: 2px solid #e1e5e9; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px 20px 0 0; }
.modal-header h4 { margin: 0; color: white; font-size: 1.5rem; font-weight: 600; }
.close-btn { background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); font-size: 1.5rem; color: #fff; cursor: pointer; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; transition: all 0.3s; }
.close-btn:hover { background: rgba(255,255,255,0.3); transform: rotate(90deg); }
.modal-body { padding: 32px; }
.modal-actions { display: flex; gap: 16px; margin-top: 20px; justify-content: flex-end; }
.modal-actions .btn-save { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 32px; font-size: 1rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(102,126,234,0.4); transition: all 0.3s; }
.modal-actions .btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.5); }
.modal-actions .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.modal-actions .btn-cancel { background: rgba(245,101,101,0.1); color: #f56565; border: 2px solid #f56565; padding: 14px 32px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.3s; }
.modal-actions .btn-cancel:hover { background: #f56565; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,101,101,0.4); }
.error-message { color: #e53e3e; font-size: 0.875rem; padding: 12px; background: #fed7d7; border-radius: 8px; display: flex; align-items: center; gap: 8px; margin-top: 16px; }

@media (max-width: 768px) {
  .profile-header { flex-direction: column; text-align: center; }
  .form-actions { flex-direction: column; }
  .modal-actions { flex-direction: column; }
}
</style>
