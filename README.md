# 🃏 Scrum Poker - Planning Poker Online

Site de Planning Poker para times ágeis realizarem estimativas colaborativas em tempo real.

## 🚀 Como Configurar

### 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto" ou "Create a project"
3. Digite um nome para o projeto (ex: "scrum-poker-meu-time")
4. Desabilite o Google Analytics (não é necessário) ou deixe habilitado
5. Clique em "Criar projeto"

### 2. Configurar Realtime Database

1. No menu lateral, vá em **Build** > **Realtime Database**
2. Clique em "Criar banco de dados" ou "Create Database"
3. Escolha a localização mais próxima (ex: `us-central1`)
4. **IMPORTANTE**: Escolha "Iniciar em modo de teste" (Start in test mode)
   - Isso permite leitura/escrita sem autenticação por 30 dias
5. Clique em "Ativar"

### 3. Configurar Regras de Segurança

1. Na aba "Regras" do Realtime Database, substitua pelas regras abaixo:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

2. Clique em "Publicar"

### 4. Obter Credenciais do Firebase

1. Clique no ícone de engrenagem (⚙️) ao lado de "Visão geral do projeto"
2. Clique em "Configurações do projeto"
3. Role até "Seus aplicativos"
4. Clique no ícone `</>` (Web)
5. Registre o app com um apelido (ex: "scrum-poker-web")
6. **NÃO** marque "Firebase Hosting"
7. Clique em "Registrar app"
8. Copie o objeto `firebaseConfig` que aparece

### 5. Configurar o Site

#### ⚠️ IMPORTANTE: Segurança das Credenciais

**NUNCA commite suas credenciais do Firebase diretamente no código!**

Para proteger suas credenciais:

1. Copie o arquivo `env.js.example` para `env.js`:
   ```bash
   cp env.js.example env.js
   ```

2. Abra o arquivo `env.js` e substitua os valores pelas suas credenciais do Firebase:

```javascript
window.ENV = {
  FIREBASE_API_KEY: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  FIREBASE_AUTH_DOMAIN: "seu-projeto.firebaseapp.com",
  FIREBASE_DATABASE_URL: "https://seu-projeto-default-rtdb.firebaseio.com",
  FIREBASE_PROJECT_ID: "seu-projeto",
  FIREBASE_STORAGE_BUCKET: "seu-projeto.appspot.com",
  FIREBASE_MESSAGING_SENDER_ID: "123456789012",
  FIREBASE_APP_ID: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

3. O arquivo `env.js` está no `.gitignore` e **NÃO será commitado**
4. O arquivo `app.js` carrega as credenciais do `window.ENV`

#### Alternativa: Usar Variáveis de Ambiente do GitHub Pages

Para maior segurança em produção:

1. Remova as credenciais do `env.js`
2. Configure as credenciais como **Secrets** no GitHub:
   - Vá em **Settings** > **Secrets and variables** > **Actions**
   - Adicione cada credencial como um secret
3. Use GitHub Actions para injetar as variáveis durante o deploy

### 6. Publicar no GitHub Pages

1. Crie um repositório no GitHub (público ou privado)
2. **ANTES de fazer commit**, verifique que o `.gitignore` está configurado:
   ```
   # Environment variables
   .env
   env.js
   
   # Firebase credentials
   firebase-config.js
   ```
3. Faça upload dos arquivos:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `env.js.example` (template sem credenciais)
   - `.gitignore`
   - **NÃO ENVIE** `env.js` (com credenciais reais)
4. Para o GitHub Pages funcionar, você precisa criar `env.js` diretamente no repositório ou configurar secrets
5. Vá em **Settings** > **Pages**
6. Em "Source", selecione "Deploy from a branch"
7. Escolha a branch `main` e pasta `/ (root)`
8. Clique em "Save"
9. Aguarde alguns minutos e acesse o link fornecido

**Exemplo de link**: `https://seu-usuario.github.io/nome-do-repositorio/`

## 🎮 Como Usar

### Criar uma Sala

1. Digite seu nome de usuário
2. Escolha o conjunto de cartas (Fibonacci, Sequencial, Tamanhos, ou Personalizado)
3. Marque "Todos os usuários são administradores" se desejar
4. Clique em "CRIAR SALA"
5. **Anote o código da sala** (ex: ABCDEF) para compartilhar com o time

### Entrar em uma Sala

1. Digite seu nome de usuário
2. Digite o código da sala compartilhado
3. Clique em "ENTRAR NA SALA"

### Votar

1. Aguarde o administrador definir a história/tarefa
2. Clique na carta que representa sua estimativa
3. Aguarde todos votarem
4. O administrador revela as cartas

### Administrador

- Digite o nome da história/tarefa no campo
- Clique em "REVELAR CARTAS" para mostrar os votos de todos
- Veja as estatísticas (média e distribuição)
- Clique em "NOVA RODADA" para resetar e começar nova votação

## ✨ Funcionalidades

- ✅ **Tempo Real**: Atualizações instantâneas para todos os participantes
- ✅ **Múltiplos Conjuntos**: Fibonacci, Sequencial, Tamanhos, ou personalizado
- ✅ **Estatísticas**: Média automática e gráfico de distribuição
- ✅ **Responsivo**: Funciona em desktop e mobile
- ✅ **Admin Flexível**: Todos podem ser admins ou apenas o criador
- ✅ **Limpo Automaticamente**: Salas vazias são removidas automaticamente

## 🔒 Segurança

⚠️ **IMPORTANTE**: As regras atuais permitem qualquer pessoa ler/escrever no banco de dados. Para produção, considere:

1. Implementar autenticação Firebase
2. Adicionar regras de validação
3. Limitar taxa de requisições

### Regras de Segurança Melhoradas (Opcional)

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": "!data.exists() || data.child('participants').hasChild(auth.uid)",
        "participants": {
          "$userId": {
            ".validate": "newData.hasChildren(['name', 'vote', 'isAdmin'])"
          }
        }
      }
    }
  }
}
```

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript (ES6+)
- Firebase Realtime Database

## 📝 Licença

Livre para uso pessoal e comercial.

## 🤝 Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12) para erros
2. Confirme que as credenciais Firebase estão corretas
3. Verifique se as regras do Realtime Database estão configuradas
4. Certifique-se que o banco de dados está ativo

---

**Desenvolvido para facilitar cerimônias de Planning Poker de times ágeis** 🚀
