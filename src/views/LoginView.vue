<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo e Título -->
      <div class="login-header">
        <div class="logo-section">
          <i class="bi bi-person-badge"></i>
          <h1>Sistema Dança</h1>
          <p>Entre com suas credenciais para continuar</p>
        </div>
      </div>

      <!-- Formulário de Login -->
      <div class="login-form-container">
        <form @submit.prevent="login" class="login-form">
          <div class="form-group">
            <label for="username">
              <i class="bi bi-person"></i> Usuário
            </label>
            <input 
              v-model="username" 
              id="username"
              type="text"
              autocomplete="username"
              placeholder="Digite seu usuário"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">
              <i class="bi bi-lock"></i> Senha
            </label>
            <input 
              v-model="password" 
              id="password"
              type="password" 
              autocomplete="current-password"
              placeholder="Digite sua senha"
              required
            />
          </div>

          <p v-if="error" class="error-message">
            <i class="bi bi-exclamation-triangle"></i> {{ error }}
          </p>

          <button type="submit" class="btn-login" :disabled="loading">
            <span v-if="loading">
              <i class="bi bi-hourglass-split"></i> Entrando...
            </span>
            <span v-else>
              <i class="bi bi-box-arrow-in-right"></i> Entrar
            </span>
          </button>

          <div class="login-footer">
            <p>Não tem uma conta? <a href="#cadastro" @click.prevent="showRegister = !showRegister">Cadastre-se</a></p>
          </div>
        </form>

        <!-- Formulário de Registro -->
        <form v-if="showRegister" @submit.prevent="register" class="register-form">
          <div class="form-group">
            <label for="reg-username">
              <i class="bi bi-person"></i> Usuário
            </label>
            <input 
              v-model="registerForm.username" 
              id="reg-username"
              type="text"
              placeholder="Escolha um nome de usuário"
              required
            />
          </div>

          <div class="form-group">
            <label for="reg-email">
              <i class="bi bi-envelope"></i> Email
            </label>
            <input 
              v-model="registerForm.email" 
              id="reg-email"
              type="email"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="reg-password">
              <i class="bi bi-lock"></i> Senha
            </label>
            <input 
              v-model="registerForm.password" 
              id="reg-password"
              type="password" 
              placeholder="Mínimo 8 caracteres"
              required
            />
          </div>

          <div class="form-group">
            <label for="reg-password-confirm">
              <i class="bi bi-lock-fill"></i> Confirmar Senha
            </label>
            <input 
              v-model="registerForm.passwordConfirm" 
              id="reg-password-confirm"
              type="password" 
              placeholder="Digite a senha novamente"
              required
            />
          </div>

          <p v-if="registerError" class="error-message">
            <i class="bi bi-exclamation-triangle"></i> {{ registerError }}
          </p>

          <button type="submit" class="btn-register" :disabled="registering">
            <span v-if="registering">
              <i class="bi bi-hourglass-split"></i> Cadastrando...
            </span>
            <span v-else>
              <i class="bi bi-person-plus"></i> Cadastrar
            </span>
          </button>

          <div class="register-footer">
            <p>Já tem uma conta? <a href="#login" @click.prevent="showRegister = false">Fazer login</a></p>
          </div>
        </form>
      </div>
    </div>

    <!-- Background decorativo -->
    <div class="login-background">
      <div class="gradient-circle circle-1"></div>
      <div class="gradient-circle circle-2"></div>
      <div class="gradient-circle circle-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showRegister = ref(false)

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  passwordConfirm: ''
})
const registerError = ref('')
const registering = ref(false)

async function login() {
  error.value = ''
  loading.value = true
  try {
    const { data } = await api.post('/auth/token/', { 
      username: username.value, 
      password: password.value 
    })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    
    // Buscar informações do usuário para determinar se é superuser
    try {
      const userData = await api.get('/auth/user/')
      localStorage.setItem('user_data', JSON.stringify(userData.data))
    } catch (e) {
      console.warn('Não foi possível buscar dados do usuário:', e)
    }
    
    window.location.href = '/'
  } catch (e) {
    error.value = 'Credenciais inválidas. Verifique seu usuário e senha.'
  } finally {
    loading.value = false
  }
}

async function register() {
  registerError.value = ''
  
  if (registerForm.value.password !== registerForm.value.passwordConfirm) {
    registerError.value = 'As senhas não coincidem'
    return
  }

  if (registerForm.value.password.length < 8) {
    registerError.value = 'A senha deve ter no mínimo 8 caracteres'
    return
  }

  registering.value = true
  try {
    await api.post('/auth/register/', {
      username: registerForm.value.username,
      email: registerForm.value.email,
      password: registerForm.value.password,
      password2: registerForm.value.passwordConfirm
    })
    
    // Login automático após registro
    username.value = registerForm.value.username
    password.value = registerForm.value.password
    await login()
  } catch (e) {
    registerError.value = e.response?.data?.detail || 'Erro ao criar conta. Tente novamente.'
  } finally {
    registering.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
}

.gradient-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -150px;
  right: -150px;
  animation: float 20s ease-in-out infinite;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -100px;
  left: -100px;
  animation: float 15s ease-in-out infinite reverse;
}

.circle-3 {
  width: 250px;
  height: 250px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 25s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.logo-section i {
  font-size: 4rem;
  margin-bottom: 20px;
  display: block;
  opacity: 0.9;
}

.logo-section h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.logo-section p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.login-form-container {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  backdrop-filter: blur(10px);
}

.login-form,
.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

label i {
  font-size: 1.1rem;
  color: #667eea;
}

input {
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #f8f9fa;
}

input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  padding: 12px;
  background: #fed7d7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-login,
.btn-register {
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.btn-login {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-register {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.4);
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.5);
}

.btn-register:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer,
.register-footer {
  text-align: center;
  margin-top: 16px;
  color: #718096;
  font-size: 0.9rem;
}

.login-footer a,
.register-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-footer a:hover,
.register-footer a:hover {
  text-decoration: underline;
}

/* Responsividade */
@media (max-width: 640px) {
  .login-container {
    padding: 20px;
  }
  
  .login-form-container {
    padding: 24px;
  }

  .logo-section h1 {
    font-size: 2rem;
  }
}
</style>
