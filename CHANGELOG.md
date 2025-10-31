# 📋 Changelog - Sistema Dança Frontend

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.1.0] - 2024-12-XX

### ✨ Adicionado
- **Nova página de Gestão de Pedidos** (`PedidosView.vue`)
  - Dashboard com estatísticas de pedidos (Total, Pendentes, Pagos, Entregues)
  - Tabela completa de pedidos com filtros e busca
  - Gestão de status de pedidos
  - Ações de edição e visualização

- **Nova página de Nota Fiscal** (`NotaFiscalView.vue`)
  - Visualização de notas fiscais (não oficiais)
  - Exibição completa de dados do pedido
  - Informações de pagamento
  - Layout profissional para impressão

- **Componente PaymentModal aprimorado**
  - Suporte para pagamento de pedidos além de inscrições
  - Integração com QR Code PIX
  - Suporte a múltiplos gateways de pagamento (PagSeguro)
  - Formulário de cartão de crédito com parcelamento
  - Feedback visual durante processamento

- **Melhorias no Sidebar**
  - Novo menu de "Pedidos" para administradores
  - Organização melhorada dos itens de menu

- **Atualizações em PagamentosView**
  - Modal de criação com seleção de tipo de pagamento
  - Suporte para pagamento de camisas, inscrições, planejamentos e pedidos existentes
  - Interface melhorada para diferentes fluxos de pagamento

### 🔄 Modificado
- **HomeView.vue**
  - Dashboard aprimorado com estatísticas
  - Melhor visualização de eventos e categorias
  - Cards de acesso rápido atualizados

- **EventosView.vue**
  - Melhorias na visualização e gestão de eventos
  - Interface mais intuitiva

- **InscricoesView.vue**
  - Integração com PaymentModal
  - Melhor experiência de pagamento

- **MeusPedidosView.vue**
  - Interface atualizada
  - Melhor integração com sistema de pagamentos
  - Visualização de pedidos do usuário logado

- **PerfilView.vue**
  - Melhorias na interface
  - Atualizações de dados do usuário

- **PlanejamentosView.vue**
  - Melhorias na visualização
  - Integração com sistema de pagamentos

- **ResumoCaixaView.vue**
  - Dashboard financeiro aprimorado
  - Melhor visualização de dados

- **CamisasView.vue**
  - Interface atualizada
  - Melhor gestão de estoque

- **Router (`src/router/index.js`)**
  - Nova rota `/pedidos` para gestão de pedidos
  - Nova rota `/nota-fiscal/:id` para visualização de notas fiscais
  - Guards de navegação atualizados

- **API Service (`src/services/api.js`)**
  - Melhorias nos interceptors
  - Tratamento de erros aprimorado

### 🔧 Ajustes Técnicos
- Refatoração de componentes para melhor reutilização
- Melhorias na estrutura de código
- Otimizações de performance
- Atualizações de estilo e design

---

## [1.0.0] - 2024-12-XX

### ✨ Versão Inicial
- Estrutura base do projeto Vue 3 + Vite
- Sistema de autenticação JWT
- Roteamento completo com Vue Router
- Integração com API backend
- Componentes base: Navbar, Sidebar, DataTable
- Views principais:
  - Login e autenticação
  - Home/Dashboard
  - Gestão de Categorias
  - Gestão de Eventos
  - Gestão de Camisas
  - Gestão de Lotes
  - Gestão de Tipo de Eventos
  - Gestão de Inscrições
  - Gestão de Profissionais
  - Planejamentos
  - Entradas e Saídas
  - Pagamentos
  - Resumo de Caixa
  - Perfil do Usuário
  - Meus Pedidos
  - Meus Eventos
  - Calendário

### 🎨 Design
- Interface moderna com gradientes
- Design responsivo
- Bootstrap Icons para ícones
- Layout com sidebar e navbar

### 🔐 Segurança
- Autenticação JWT
- Refresh token automático
- Guards de rota
- Controle de acesso por níveis (superuser/usuário normal)

---

## Tipos de Mudanças

- **✨ Adicionado** - Para novas funcionalidades
- **🔄 Modificado** - Para mudanças em funcionalidades existentes
- **🗑️ Depreciado** - Para funcionalidades que serão removidas em breve
- **❌ Removido** - Para funcionalidades removidas
- **🐛 Corrigido** - Para correções de bugs
- **🔒 Segurança** - Para vulnerabilidades corrigidas

---

## Como usar este changelog

1. Cada versão lista as mudanças agrupadas por tipo
2. Versões seguem o padrão SemVer: MAJOR.MINOR.PATCH
3. Datas são no formato YYYY-MM-DD
4. Versões são ordenadas da mais recente para a mais antiga

---

**Última atualização**: 2024-12-XX

