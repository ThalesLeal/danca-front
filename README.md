# 🎭 Sistema Dança - Frontend

Sistema de gerenciamento completo para eventos de dança, desenvolvido com Vue 3 e Vite. O sistema oferece uma interface moderna e intuitiva para gestão de eventos, participantes, inscrições, pagamentos e controle financeiro.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Autenticação](#autenticação)
- [Níveis de Acesso](#níveis-de-acesso)
- [API Backend](#api-backend)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Build de Produção](#build-de-produção)
- [Responsividade](#responsividade)

## 🎯 Sobre o Projeto

O **Sistema Dança** é uma aplicação web completa desenvolvida para facilitar o gerenciamento de eventos de dança. O sistema permite:

- 🎪 Gerenciamento de eventos
- 👥 Cadastro e gestão de profissionais
- 📝 Gestão de inscrições
- 💰 Controle financeiro (entradas, saídas, pagamentos)
- 📊 Relatórios e resumos de caixa
- 🎨 Gestão de camisas e categorias
- 📅 Planejamento de eventos
- 👤 Perfil e pedidos dos usuários

## 🛠 Tecnologias Utilizadas

### Core
- **Vue 3** (v3.5.22) - Framework JavaScript progressivo
- **Vite** (v7.1.7) - Build tool ultrarrápido
- **Vue Router** (v4.6.3) - Roteamento oficial do Vue
- **Axios** (v1.13.0) - Cliente HTTP para requisições à API

### Dependências de Desenvolvimento
- **@vitejs/plugin-vue** (v6.0.1) - Plugin do Vue para Vite

### Estilização
- **Bootstrap Icons** - Biblioteca de ícones via CDN
- CSS3 com gradientes modernos
- Design responsivo

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado na sua máquina:

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn** (gerenciador de pacotes)
- **Git** (para controle de versão)
- **Backend API** do Sistema Dança rodando (veja seção API Backend)

### Verificando as Instalações

```bash
node --version
npm --version
git --version
```

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/danca-frontend.git
cd danca-frontend
```

### 2. Instale as Dependências

```bash
npm install
```

Ou usando yarn:

```bash
yarn install
```

## ⚙️ Configuração

### Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para configurar a URL da API backend. Por padrão, a aplicação se conecta a `http://127.0.0.1:8000/api`.

Para alterar a URL da API, você pode:

1. **Criar um arquivo `.env` na raiz do projeto:**

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

2. **Ou usar variáveis de ambiente diretamente:**

```bash
export VITE_API_BASE_URL=http://localhost:8000/api
```

### Exemplo de Arquivo `.env`

```env
# URL da API Backend
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# Ambiente (opcional)
VITE_ENV=development
```

> ⚠️ **Importante**: Variáveis que começam com `VITE_` são expostas ao frontend. Não inclua informações sensíveis.

## ▶️ Executando o Projeto

### Modo de Desenvolvimento

Para iniciar o servidor de desenvolvimento com hot-reload:

```bash
npm run dev
```

A aplicação estará disponível em: `http://localhost:5173`

> O Vite oferece hot module replacement (HMR), então as mudanças no código são refletidas automaticamente no navegador.

### Visualizar Build de Produção

Para visualizar como ficará a aplicação em produção:

```bash
npm run build
npm run preview
```

## 📁 Estrutura do Projeto

```
danca-frontend/
├── public/                 # Arquivos estáticos
│   ├── logo.png           # Logo da aplicação
│   └── vite.svg           # Ícone padrão
├── src/
│   ├── assets/            # Assets estáticos
│   │   └── vue.svg
│   ├── components/        # Componentes Vue reutilizáveis
│   │   ├── DataTable.vue      # Tabela de dados genérica
│   │   ├── HelloWorld.vue     # Componente de exemplo
│   │   ├── Navbar.vue         # Barra de navegação superior
│   │   ├── PaymentModal.vue   # Modal de pagamento
│   │   └── Sidebar.vue        # Menu lateral
│   ├── router/            # Configuração de rotas
│   │   └── index.js       # Definição de todas as rotas
│   ├── services/          # Serviços e APIs
│   │   └── api.js         # Configuração do Axios e interceptors
│   ├── views/             # Páginas/Views da aplicação
│   │   ├── CalendarioView.vue
│   │   ├── CamisasView.vue
│   │   ├── CategoriasView.vue
│   │   ├── EntradasView.vue
│   │   ├── EventosView.vue
│   │   ├── HomeView.vue
│   │   ├── InscricoesView.vue
│   │   ├── LoginView.vue
│   │   ├── LotesView.vue
│   │   ├── MeusEventosView.vue
│   │   ├── MeusPedidosView.vue
│   │   ├── PagamentosView.vue
│   │   ├── PerfilView.vue
│   │   ├── PlanejamentosView.vue
│   │   ├── ProfissionaisView.vue
│   │   ├── ResumoCaixaView.vue
│   │   ├── SaidasView.vue
│   │   └── TipoEventosView.vue
│   ├── App.vue            # Componente raiz
│   ├── main.js            # Ponto de entrada da aplicação
│   └── style.css          # Estilos globais
├── index.html             # Template HTML
├── package.json           # Dependências e scripts
├── vite.config.js        # Configuração do Vite
└── README.md             # Este arquivo
```

### Descrição das Pastas Principais

- **`views/`** - Contém as páginas da aplicação. Cada arquivo representa uma rota.
- **`components/`** - Componentes reutilizáveis que podem ser usados em múltiplas views.
- **`services/`** - Serviços de comunicação com a API e lógica de negócio.
- **`router/`** - Configuração de rotas, guards de navegação e middleware.
- **`assets/`** - Imagens, fontes e outros recursos estáticos.

## ✨ Funcionalidades

### 🎭 Módulos Disponíveis

#### Para Superusuários (Administradores)

1. **Cadastros**
   - 📦 Lotes
   - 🏷️ Categorias
   - 📅 Tipo de Eventos
   - 👕 Camisas

2. **Inscrição**
   - 🎤 Profissionais
   - 📝 Inscrições

3. **Planejamentos**
   - 📅 Gestão de planejamentos

4. **Pedidos**
   - 🛒 Gestão de pedidos

5. **Eventos**
   - 🎪 Gerenciamento completo de eventos

6. **Caixa**
   - 📊 Resumo de caixa
   - ⬆️ Entradas financeiras
   - ⬇️ Saídas financeiras

7. **Pagamentos**
   - 💳 Lista de pagamentos
   - ➕ Novo pagamento

#### Para Usuários Normais

1. **Meu Perfil** - Visualizar e editar dados pessoais
2. **Meus Pedidos** - Histórico de pedidos do usuário
3. **Meus Eventos** - Eventos nos quais o usuário participa
4. **Calendário** - Visualização de eventos em formato de calendário

### 🔑 Características Principais

- ✅ **Autenticação JWT** com refresh token
- ✅ **Controle de acesso** por níveis de usuário
- ✅ **Interface moderna e responsiva**
- ✅ **Navegação intuitiva** com sidebar
- ✅ **Interceptors HTTP** para tratamento automático de erros
- ✅ **Validação de tokens** na inicialização
- ✅ **Redirecionamento automático** baseado em permissões
- ✅ **Feedback visual** durante operações assíncronas

## 🔐 Autenticação

### Sistema de Autenticação

O sistema utiliza **JWT (JSON Web Tokens)** para autenticação:

1. **Login**: Usuário fornece credenciais e recebe um `access_token` e `refresh_token`
2. **Armazenamento**: Tokens são salvos no `localStorage`
3. **Interceptação**: Interceptor HTTP adiciona automaticamente o token nas requisições
4. **Refresh**: Quando o token expira, o sistema tenta renová-lo automaticamente
5. **Logout**: Remove tokens e redireciona para a página de login

### Endpoints de Autenticação

O sistema consome os seguintes endpoints do backend:

- `POST /api/auth/token/` - Login
- `POST /api/auth/token/refresh/` - Renovação de token
- `GET /api/auth/user/` - Dados do usuário logado
- `POST /api/auth/register/` - Registro de novo usuário

### Fluxo de Autenticação

```javascript
1. Usuário acessa /login
2. Submete credenciais
3. Backend retorna tokens
4. Tokens são salvos no localStorage
5. Dados do usuário são buscados
6. Informações do usuário são salvas no localStorage
7. Usuário é redirecionado conforme seu nível de acesso
```

### Guardas de Navegação

O router possui guards que protegem rotas:

- **`requiresAuth`**: Exige usuário autenticado
- **`requiresSuperUser`**: Exige usuário com permissões de admin/superuser

## 👥 Níveis de Acesso

### Superusuário/Administrador

Usuários com `is_superuser` ou `is_staff` como `true` têm acesso completo ao sistema, incluindo:

- Todos os módulos de gestão
- Cadastros diversos
- Controle financeiro
- Inscrições e profissionais
- Eventos e planejamentos

### Usuário Normal

Usuários padrão têm acesso limitado a:

- Perfil pessoal
- Pedidos próprios
- Eventos em que participa
- Calendário de eventos

### Verificação de Permissões

A verificação é feita através do campo `is_superuser` ou `is_staff` nos dados do usuário salvos no `localStorage`.

## 🌐 API Backend

### Configuração da API

O sistema precisa de uma API backend RESTful rodando. Por padrão, conecta-se a:

```
http://127.0.0.1:8000/api
```

### Como Configurar o Backend

1. Certifique-se de que o backend está rodando
2. Configure a URL correta no arquivo `.env` ou `vite.config.js`
3. A API deve implementar autenticação JWT
4. Todos os endpoints devem retornar JSON

### Exemplo de Backend Django

Se você está usando o backend Django do Sistema Dança:

```bash
# Terminal 1 - Backend
cd danca-backend
python manage.py runserver

# Terminal 2 - Frontend
cd danca-frontend
npm run dev
```

### Estrutura de Resposta da API

O sistema espera que a API siga o formato:

```json
{
  "results": [...],      // Array de resultados
  "count": 100,          // Total de registros
  "next": "url",         // URL da próxima página
  "previous": "url"      // URL da página anterior
}
```

## 🎮 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev          # Inicia servidor de desenvolvimento (porta 5173)
```

### Produção

```bash
npm run build        # Cria build de produção na pasta 'dist'
npm run preview      # Visualiza build de produção localmente
```

### Limpeza

```bash
# Para limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📦 Build de Produção

### Criando o Build

```bash
npm run build
```

Isso criará uma pasta `dist/` com os arquivos otimizados e minificados.

### Deploy

Os arquivos na pasta `dist/` podem ser enviados para qualquer servidor web estático:

- **Netlify**
- **Vercel**
- **GitHub Pages**
- **AWS S3**
- **Apache/Nginx**

### Exemplo de Deploy no Netlify

1. Conecte seu repositório GitHub ao Netlify
2. Configure o build command: `npm run build`
3. Configure o publish directory: `dist`
4. Adicione variável de ambiente: `VITE_API_BASE_URL`

## 📱 Responsividade

O sistema é totalmente responsivo e se adapta a diferentes tamanhos de tela:

- **Desktop**: Layout completo com sidebar fixa
- **Tablet**: Sidebar colapsável
- **Mobile**: Menu hambúrguer (recursos ainda não implementados)

Breakpoints utilizados:
- `max-width: 768px` - Tablets e móveis

## 🎨 Design e Estilização

### Paleta de Cores

```css
--primary-color: #667eea    /* Azul primário */
--secondary-color: #764ba2  /* Roxo secundário */
--success-color: #48bb78    /* Verde sucesso */
--warning-color: #ed8936    /* Laranja aviso */
--danger-color: #f56565     /* Vermelho erro */
```

### Características Visuais

- ✨ **Gradientes modernos** em backgrounds
- 🎨 **Cores vibrantes** para indicadores de status
- 📦 **Cards com sombras** suaves
- 🔄 **Animações suaves** em transições
- 💫 **Efeitos de hover** interativos

### Bibliotecas de Ícones

O sistema utiliza **Bootstrap Icons** via CDN para todos os ícones.

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com a API

```bash
Error: Network Error
```

**Solução**: 
- Verifique se o backend está rodando
- Confirme a URL da API no `.env`
- Verifique configurações de CORS no backend

#### 2. Token Inválido

```bash
401 Unauthorized
```

**Solução**:
- Limpe o localStorage: `localStorage.clear()`
- Faça login novamente
- Verifique a configuração de refresh token no backend

#### 3. Porta já em uso

```bash
Port 5173 is already in use
```

**Solução**:
```bash
# Encontre o processo
lsof -ti:5173

# Mate o processo
kill -9 <PID>
```

#### 4. Dependências não instaladas

```bash
Error: Cannot find module
```

**Solução**:
```bash
rm -rf node_modules
npm install
```

## 📝 Estrutura de Rotas

| Rota | Componente | Requer Auth | Requer Admin |
|------|-----------|-------------|--------------|
| `/` | HomeView | ✅ | ✅ |
| `/login` | LoginView | ❌ | ❌ |
| `/categorias` | CategoriasView | ✅ | ✅ |
| `/eventos` | EventosView | ✅ | ✅ |
| `/camisas` | CamisasView | ✅ | ✅ |
| `/lotes` | LotesView | ✅ | ✅ |
| `/tipo-eventos` | TipoEventosView | ✅ | ✅ |
| `/inscricoes` | InscricoesView | ✅ | ✅ |
| `/profissionais` | ProfissionaisView | ✅ | ✅ |
| `/planejamentos` | PlanejamentosView | ✅ | ✅ |
| `/entradas` | EntradasView | ✅ | ✅ |
| `/saidas` | SaidasView | ✅ | ✅ |
| `/pagamentos` | PagamentosView | ✅ | ✅ |
| `/resumo-caixa` | ResumoCaixaView | ✅ | ✅ |
| `/perfil` | PerfilView | ✅ | ❌ |
| `/meus-pedidos` | MeusPedidosView | ✅ | ❌ |
| `/meus-eventos` | MeusEventosView | ✅ | ❌ |
| `/calendario` | CalendarioView | ✅ | ❌ |

## 🚀 Próximos Passos

### Melhorias Futuras

- [ ] Testes unitários com Vitest
- [ ] Testes E2E com Cypress
- [ ] PWA (Progressive Web App)
- [ ] Internacionalização (i18n)
- [ ] Tema claro/escuro
- [ ] Melhorias na responsividade mobile
- [ ] Gráficos e dashboards avançados
- [ ] Notificações em tempo real

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvedor

Desenvolvido para facilitar a gestão de eventos de dança.

---

**Versão**: 0.0.0  
**Última atualização**: 2024
