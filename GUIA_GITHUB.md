# Guia Completo: Publicando no GitHub

Este guia detalha o processo passo a passo para publicar o projeto Monitor de Unidades de Saúde no GitHub.

## Pré-requisitos

Antes de começar, certifique-se de ter:

1. **Git instalado** em sua máquina
   - Verifique com: `git --version`
   - Se não tiver, baixe em: https://git-scm.com/downloads

2. **Conta no GitHub**
   - Crie em: https://github.com/signup

3. **Projeto funcionando localmente**
   - Teste executando `pnpm dev` e acessando `http://localhost:3000`

## Passo 1: Preparar o Projeto

### 1.1 Verificar o .gitignore

O arquivo `.gitignore` já está configurado no projeto. Ele garante que arquivos sensíveis não sejam enviados ao GitHub:

```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
```

**IMPORTANTE**: NUNCA remova `.env` do `.gitignore`!

### 1.2 Limpar arquivos desnecessários

```bash
# Remover node_modules (será reinstalado depois)
rm -rf node_modules

# Limpar build anterior
rm -rf dist
```

## Passo 2: Criar Repositório no GitHub

### 2.1 Acessar GitHub

1. Faça login em https://github.com
2. Clique no botão **"+"** no canto superior direito
3. Selecione **"New repository"**

### 2.2 Configurar o Repositório

Preencha os campos:

- **Repository name**: `monitor-saude` (ou outro nome de sua preferência)
- **Description**: "Aplicativo web para monitorar ocupação de unidades de saúde em tempo real"
- **Visibility**: 
  - ✅ **Public** - Se quiser que qualquer pessoa veja o código
  - ✅ **Private** - Se quiser manter o código privado
- **NÃO marque** "Initialize this repository with a README" (já temos um)

Clique em **"Create repository"**

### 2.3 Copiar a URL do Repositório

Após criar, você verá uma página com instruções. Copie a URL que aparece, será algo como:

```
https://github.com/seu-usuario/monitor-saude.git
```

## Passo 3: Configurar Git Local

### 3.1 Abrir Terminal

Navegue até a pasta do projeto:

```bash
cd /caminho/para/monitor-saude
```

### 3.2 Inicializar Git (se ainda não foi feito)

```bash
git init
```

### 3.3 Configurar seu nome e email (primeira vez apenas)

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

## Passo 4: Fazer o Primeiro Commit

### 4.1 Adicionar todos os arquivos

```bash
git add .
```

### 4.2 Verificar o que será commitado

```bash
git status
```

Você deve ver uma lista de arquivos em verde. Certifique-se de que `.env` NÃO está na lista!

### 4.3 Criar o commit

```bash
git commit -m "Initial commit: Monitor de Unidades de Saúde"
```

## Passo 5: Conectar ao GitHub

### 5.1 Renomear branch para main

```bash
git branch -M main
```

### 5.2 Adicionar o repositório remoto

Substitua `seu-usuario` pelo seu nome de usuário do GitHub:

```bash
git remote add origin https://github.com/seu-usuario/monitor-saude.git
```

### 5.3 Enviar o código para o GitHub

```bash
git push -u origin main
```

Se for a primeira vez, o GitHub pode pedir suas credenciais:
- **Username**: seu nome de usuário do GitHub
- **Password**: use um **Personal Access Token** (não sua senha)

#### Como criar um Personal Access Token:

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Dê um nome: "Monitor Saúde - Local Development"
4. Marque o escopo: **repo** (acesso completo a repositórios)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (você não verá novamente!)
7. Use o token como senha quando o Git pedir

## Passo 6: Verificar no GitHub

1. Acesse: `https://github.com/seu-usuario/monitor-saude`
2. Você deve ver todos os arquivos do projeto
3. O README.md será exibido automaticamente na página inicial

## Passo 7: Configurar Proteções (Recomendado)

### 7.1 Proteger a branch main

1. No GitHub, vá em **Settings** → **Branches**
2. Clique em **"Add rule"**
3. Em "Branch name pattern", digite: `main`
4. Marque:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
5. Clique em **"Create"**

### 7.2 Adicionar Secrets (para CI/CD futuro)

1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Clique em **"New repository secret"**
3. Adicione secrets necessários (DATABASE_URL, etc.)

**NUNCA** coloque secrets diretamente no código!

## Comandos Git Úteis para o Dia a Dia

### Verificar status

```bash
git status
```

### Adicionar mudanças

```bash
# Adicionar arquivo específico
git add arquivo.txt

# Adicionar todos os arquivos modificados
git add .
```

### Fazer commit

```bash
git commit -m "Descrição clara do que foi alterado"
```

### Enviar para GitHub

```bash
git push
```

### Atualizar código local

```bash
git pull
```

### Ver histórico de commits

```bash
git log --oneline
```

### Criar nova branch

```bash
git checkout -b feature/nova-funcionalidade
```

### Voltar para main

```bash
git checkout main
```

### Mesclar branch

```bash
git checkout main
git merge feature/nova-funcionalidade
```

## Fluxo de Trabalho Recomendado

### Para adicionar uma nova funcionalidade:

1. **Criar branch**
   ```bash
   git checkout -b feature/nome-da-funcionalidade
   ```

2. **Fazer alterações no código**

3. **Testar localmente**
   ```bash
   pnpm test
   pnpm dev
   ```

4. **Commit das alterações**
   ```bash
   git add .
   git commit -m "Adiciona funcionalidade X"
   ```

5. **Enviar branch para GitHub**
   ```bash
   git push -u origin feature/nome-da-funcionalidade
   ```

6. **Criar Pull Request no GitHub**
   - Acesse o repositório no GitHub
   - Clique em **"Compare & pull request"**
   - Descreva as mudanças
   - Clique em **"Create pull request"**

7. **Revisar e mesclar**
   - Após revisão, clique em **"Merge pull request"**
   - Delete a branch após merge

8. **Atualizar código local**
   ```bash
   git checkout main
   git pull
   ```

## Solução de Problemas Comuns

### Erro: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/seu-usuario/monitor-saude.git
```

### Erro: "failed to push some refs"

```bash
git pull --rebase origin main
git push
```

### Esqueci de adicionar .env no .gitignore

Se você acidentalmente commitou o `.env`:

```bash
# Remover do Git (mas manter localmente)
git rm --cached .env

# Adicionar ao .gitignore
echo ".env" >> .gitignore

# Commit
git add .gitignore
git commit -m "Remove .env do repositório"
git push
```

**IMPORTANTE**: Depois disso, **MUDE TODAS AS SENHAS E CHAVES** que estavam no `.env`!

### Conflitos ao fazer merge

```bash
# Ver arquivos em conflito
git status

# Editar os arquivos e resolver conflitos manualmente
# Procure por marcadores: <<<<<<<, =======, >>>>>>>

# Após resolver
git add .
git commit -m "Resolve conflitos"
git push
```

## Boas Práticas

### Mensagens de Commit

✅ **BOM**:
- "Adiciona filtro por tipo de unidade"
- "Corrige bug no cálculo de tempo de espera"
- "Atualiza documentação do README"

❌ **RUIM**:
- "mudanças"
- "fix"
- "asdfasdf"

### Commits Frequentes

- Faça commits pequenos e frequentes
- Cada commit deve representar uma mudança lógica
- Não acumule muitas alterações em um único commit

### Branches

- Use branches para novas funcionalidades
- Mantenha a `main` sempre estável
- Delete branches após merge

### Segurança

- **NUNCA** commite:
  - Arquivos `.env`
  - Senhas
  - Chaves de API
  - Tokens de autenticação
  - Dados sensíveis

## Próximos Passos

Após publicar no GitHub, você pode:

1. **Configurar GitHub Actions** para testes automáticos
2. **Adicionar badges** ao README (build status, coverage, etc.)
3. **Criar releases** para versões estáveis
4. **Configurar deploy automático** (Vercel, Railway, etc.)
5. **Convidar colaboradores** para contribuir

## Recursos Adicionais

- [Documentação oficial do Git](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Atlassian Git Tutorial](https://www.atlassian.com/git/tutorials)
- [Oh My Git! (jogo para aprender Git)](https://ohmygit.org/)

---

**Dica Final**: Pratique! A melhor forma de aprender Git é usando no dia a dia. Não tenha medo de errar, você sempre pode voltar atrás com Git.
