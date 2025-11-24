# 🔒 Guia de Segurança - Scrum Poker

## ⚠️ Problema Identificado pelo GitHub

O GitHub detectou que credenciais do Firebase foram expostas no repositório. Isso representa um risco de segurança, pois qualquer pessoa com acesso ao código pode usar suas credenciais.

## ✅ Solução Implementada

### 1. Estrutura de Arquivos de Segurança

- **`.env`** - Contém suas credenciais REAIS (NÃO commitar)
- **`.env.example`** - Template sem credenciais para compartilhar
- **`env.js`** - Script que carrega credenciais no navegador (NÃO commitar)
- **`env.js.example`** - Template do env.js para compartilhar
- **`.gitignore`** - Garante que arquivos sensíveis não sejam commitados

### 2. Próximos Passos (IMPORTANTE!)

#### Passo 1: Revogar a API Key Exposta

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Configurações do Projeto** (⚙️) > **Configurações gerais**
4. Role até "Seus aplicativos" > "SDK do Firebase"
5. Clique em **Chaves de API da Web**
6. **DELETE a chave atual** (a que foi exposta)
7. **Crie uma nova chave**

#### Passo 2: Atualizar env.js com a Nova Chave

1. Abra o arquivo `env.js` (no seu computador)
2. Substitua `FIREBASE_API_KEY` pela nova chave gerada
3. **NÃO commite este arquivo!**

#### Passo 3: Limpar o Histórico do Git

As credenciais antigas ainda estão no histórico do Git. Para removê-las completamente:

**Opção 1: Usando BFG Repo-Cleaner (Recomendado)**

```bash
# 1. Instale o BFG
# Download em: https://rtyley.github.io/bfg-repo-cleaner/

# 2. Faça um backup do repositório
git clone --mirror https://github.com/seu-usuario/seu-repo.git

# 3. Execute o BFG para remover as credenciais
java -jar bfg.jar --replace-text passwords.txt seu-repo.git

# 4. Limpe o histórico
cd seu-repo.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push
git push --force
```

**Opção 2: Usando git filter-repo**

```bash
# 1. Instale git filter-repo
pip install git-filter-repo

# 2. Remova o arquivo do histórico
git filter-repo --path app.js --invert-paths

# 3. Force push
git push --force
```

**Opção 3: Criar Repositório Novo (Mais Simples)**

Se você não tem muitos commits importantes:

1. Delete o repositório atual no GitHub
2. Crie um novo repositório
3. Faça o primeiro commit com os arquivos já protegidos

#### Passo 4: Verificar Segurança das Regras do Firebase

Suas regras atuais permitem acesso total. Para produção, use regras mais restritivas:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": "!data.exists() || data.child('participants').hasChild(auth.uid)"
      }
    }
  }
}
```

#### Passo 5: Monitorar Uso do Firebase

1. Acesse o Firebase Console
2. Vá em **Usage and billing**
3. Monitore se há acessos anormais
4. Configure alertas de uso

### 3. Deploy Seguro no GitHub Pages

Para deployar no GitHub Pages com segurança:

**Opção A: Arquivo env.js no Repositório (Para Sites Públicos)**

Se o site é público, as credenciais do Firebase precisam estar no cliente de qualquer forma. Neste caso:

1. Use **Regras de Segurança do Firebase** para controlar o acesso
2. Configure um domínio específico no Firebase
3. Limite a API Key a esse domínio

**Opção B: GitHub Actions com Secrets (Mais Seguro)**

1. Vá em **Settings** > **Secrets and variables** > **Actions**
2. Adicione cada credencial como secret:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - etc.

3. Crie um workflow `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Create env.js
        run: |
          echo "(function() {" > env.js
          echo "  window.ENV = {" >> env.js
          echo "    FIREBASE_API_KEY: '${{ secrets.FIREBASE_API_KEY }}'," >> env.js
          echo "    FIREBASE_AUTH_DOMAIN: '${{ secrets.FIREBASE_AUTH_DOMAIN }}'," >> env.js
          echo "    FIREBASE_DATABASE_URL: '${{ secrets.FIREBASE_DATABASE_URL }}'," >> env.js
          echo "    FIREBASE_PROJECT_ID: '${{ secrets.FIREBASE_PROJECT_ID }}'," >> env.js
          echo "    FIREBASE_STORAGE_BUCKET: '${{ secrets.FIREBASE_STORAGE_BUCKET }}'," >> env.js
          echo "    FIREBASE_MESSAGING_SENDER_ID: '${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}'," >> env.js
          echo "    FIREBASE_APP_ID: '${{ secrets.FIREBASE_APP_ID }}'" >> env.js
          echo "  };" >> env.js
          echo "})();" >> env.js
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

### 4. Checklist de Segurança

- [ ] Revoguei a API Key antiga no Firebase
- [ ] Criei uma nova API Key
- [ ] Atualizei o `env.js` local com a nova chave
- [ ] Removi as credenciais antigas do histórico do Git
- [ ] Verifiquei que `.gitignore` está protegendo `env.js`
- [ ] Configurei regras de segurança no Firebase
- [ ] Monitorei o uso do Firebase por atividades suspeitas
- [ ] (Opcional) Configurei domínios autorizados no Firebase

### 5. Boas Práticas

✅ **FAÇA:**
- Use `.gitignore` para proteger arquivos sensíveis
- Separe credenciais em arquivos de ambiente
- Revogue credenciais imediatamente após exposição
- Use regras de segurança do Firebase
- Monitore uso e acessos

❌ **NÃO FAÇA:**
- Commitar credenciais diretamente no código
- Compartilhar credenciais em mensagens ou emails
- Usar as mesmas credenciais em dev e produção
- Ignorar alertas de segurança do GitHub

## 📚 Referências

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [git filter-repo](https://github.com/newren/git-filter-repo)
