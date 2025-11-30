# Monitor de Unidades de Saúde

Aplicativo web para monitorar em tempo real a ocupação de UBS, postos de saúde e hospitais, permitindo que usuários tomem decisões informadas sobre qual unidade buscar atendimento.

## 🎯 Funcionalidades

### Para Usuários
- **Mapa Interativo**: Visualize todas as unidades de saúde em um mapa do Google Maps
- **Indicadores Visuais**: Marcadores coloridos indicam o nível de ocupação de cada unidade
  - 🟢 Verde: Ocupação baixa
  - 🟡 Amarelo: Ocupação média
  - 🟠 Laranja: Ocupação alta
  - 🔴 Vermelho: Ocupação crítica
- **Filtros por Tipo**: Filtre unidades por UBS, Postos de Saúde ou Hospitais
- **Detalhes da Unidade**: Veja informações completas ao clicar em uma unidade:
  - Endereço completo
  - Telefone de contato
  - Tempo médio de espera
  - Número de pessoas aguardando
  - Botão "Como Chegar" com integração ao Google Maps
- **Lista de Unidades**: Navegue pela lista completa com informações resumidas

### Para Administradores
- **Painel Administrativo**: Interface dedicada para gerenciar unidades (acesso em `/admin`)
- **CRUD Completo**: Criar, editar e remover unidades de saúde
- **Popular Banco**: Botão para adicionar dados de exemplo

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11
- **Banco de Dados**: MySQL (via Drizzle ORM)
- **Autenticação**: Manus OAuth
- **Mapas**: Google Maps JavaScript API (via proxy Manus)
- **UI Components**: shadcn/ui
- **Testes**: Vitest

## 📋 Pré-requisitos

- Node.js 22.x ou superior
- pnpm (gerenciador de pacotes)
- Banco de dados MySQL (local ou remoto)

## 🚀 Instalação e Configuração Local

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/monitor-saude.git
cd monitor-saude
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL=mysql://usuario:senha@localhost:3306/monitor_saude

# Autenticação (Manus OAuth)
JWT_SECRET=seu_jwt_secret_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Informações do Proprietário
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome

# Configurações da Aplicação
VITE_APP_ID=monitor-saude
VITE_APP_TITLE=Monitor de Unidades de Saúde
VITE_APP_LOGO=/logo.svg

# APIs Manus (para Google Maps e outros serviços)
BUILT_IN_FORGE_API_URL=https://forge.butterfly-effect.dev
BUILT_IN_FORGE_API_KEY=sua_chave_api_backend
VITE_FRONTEND_FORGE_API_URL=https://forge.butterfly-effect.dev
VITE_FRONTEND_FORGE_API_KEY=sua_chave_api_frontend

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

**Nota**: Para obter as chaves de API do Manus, você precisa criar uma conta em [Manus](https://manus.im) e configurar um projeto.

### 4. Configure o banco de dados

Execute as migrações para criar as tabelas:

```bash
pnpm db:push
```

### 5. Inicie o servidor de desenvolvimento

```bash
pnpm dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 🗄️ Estrutura do Banco de Dados

### Tabela: users
Gerenciada automaticamente pelo sistema de autenticação Manus.

### Tabela: healthUnits
```sql
- id: INT (auto-increment, primary key)
- name: VARCHAR(255)
- type: ENUM('ubs', 'posto', 'hospital')
- address: TEXT
- latitude: VARCHAR(50)
- longitude: VARCHAR(50)
- phone: VARCHAR(20)
- occupancyLevel: ENUM('baixo', 'medio', 'alto', 'critico')
- averageWaitTime: INT (em minutos)
- waitingCount: INT
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

## 👥 Gerenciamento de Usuários

### Tornar um usuário administrador

Por padrão, o proprietário do projeto (definido em `OWNER_OPEN_ID`) é automaticamente administrador. Para promover outros usuários:

1. Acesse o painel de gerenciamento do banco de dados
2. Localize o usuário na tabela `users`
3. Altere o campo `role` de `user` para `admin`

Ou execute via SQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'usuario@exemplo.com';
```

## 🧪 Testes

Execute os testes com:

```bash
pnpm test
```

Os testes cobrem:
- Listagem de unidades
- Filtros por tipo
- Operações CRUD (apenas para administradores)
- Seed de dados de exemplo

## 📦 Build para Produção

```bash
pnpm build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## 🌐 Publicação no GitHub

### 1. Crie um repositório no GitHub

Acesse [GitHub](https://github.com/new) e crie um novo repositório.

### 2. Configure o Git local

```bash
git init
git add .
git commit -m "Initial commit: Monitor de Unidades de Saúde"
git branch -M main
git remote add origin https://github.com/seu-usuario/monitor-saude.git
git push -u origin main
```

### 3. Proteja informações sensíveis

Certifique-se de que o arquivo `.env` está no `.gitignore` (já incluído por padrão).

**NUNCA** commite:
- Arquivos `.env`
- Chaves de API
- Senhas de banco de dados
- Tokens de autenticação

### 4. Configure GitHub Actions (opcional)

Crie `.github/workflows/test.yml` para executar testes automaticamente:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
```

## 🚀 Deploy

### Opções de Deploy

1. **Manus Platform**: Use o botão "Publish" no painel de gerenciamento
2. **Vercel**: Conecte seu repositório GitHub
3. **Railway**: Deploy com um clique
4. **VPS**: Configure Nginx + PM2

### Variáveis de Ambiente em Produção

Certifique-se de configurar todas as variáveis de ambiente no seu provedor de hospedagem.

## 📝 Uso

### Acesso Público
- Acesse a página inicial em `/`
- Visualize o mapa com todas as unidades
- Use os filtros para encontrar UBS, Postos ou Hospitais
- Clique em um marcador ou na lista para ver detalhes
- Use "Como Chegar" para abrir rotas no Google Maps

### Acesso Administrativo
1. Faça login com uma conta administradora
2. Acesse `/admin`
3. Gerencie unidades de saúde:
   - Criar nova unidade
   - Editar informações existentes
   - Remover unidades
   - Popular banco com dados de exemplo

## 🔧 Desenvolvimento

### Comandos Úteis

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev

# Executar testes
pnpm test

# Executar testes em modo watch
pnpm test:watch

# Build para produção
pnpm build

# Visualizar build de produção
pnpm preview

# Atualizar schema do banco
pnpm db:push

# Gerar migrações
pnpm db:generate
```

### Estrutura de Pastas

```
monitor-saude/
├── client/                 # Frontend React
│   ├── public/            # Arquivos estáticos
│   └── src/
│       ├── components/    # Componentes reutilizáveis
│       ├── pages/         # Páginas da aplicação
│       ├── lib/           # Utilitários e configurações
│       └── hooks/         # Custom hooks
├── server/                # Backend Express + tRPC
│   ├── _core/            # Configurações do framework
│   ├── db.ts             # Queries do banco de dados
│   ├── routers.ts        # Procedures tRPC
│   └── *.test.ts         # Testes
├── drizzle/              # Schema e migrações do banco
├── shared/               # Código compartilhado
└── README.md
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para reportar bugs ou solicitar features, abra uma [issue](https://github.com/seu-usuario/monitor-saude/issues) no GitHub.

