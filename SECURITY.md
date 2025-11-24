# 🔒 Guia de Segurança - Scrum Poker

## 📌 Sobre Credenciais do Firebase em Sites Estáticos

### Por que as credenciais estão no código?

Para sites estáticos (como GitHub Pages), as credenciais do Firebase **precisam** estar no código JavaScript do cliente. Isso é:

- ✅ **Normal** - Todos os sites Firebase públicos fazem isso
- ✅ **Esperado** - O Firebase foi projetado para isso
- ✅ **Seguro** - Quando configurado corretamente

### A segurança REAL vem das Regras do Firebase

As API Keys do Firebase são **identificadores públicos**, não segredos. A verdadeira segurança está em:

1. **Regras de Segurança do Firebase** (controle de acesso)
2. **Domínios autorizados** (limitar onde o app pode rodar)
3. **Monitoramento de uso** (detectar abusos)

## 🛡️ Como Proteger Seu Projeto

### 1. Configure Regras de Segurança Adequadas

No Firebase Console, vá em **Realtime Database > Rules** e configure:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['participants'])"
      }
    }
  }
}
```

**Regras mais restritivas (recomendado para produção):**

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

### 2. Limite Domínios Autorizados

1. No Firebase Console, vá em **Authentication**
2. Clique em **Sign-in method**
3. Role até **Authorized domains**
4. Adicione apenas seus domínios:
   - `seu-usuario.github.io`
   - `localhost` (para desenvolvimento)
5. Remova domínios desnecessários

### 3. Configure Alertas de Uso

1. No Firebase Console, vá em **Usage and billing**
2. Configure **Budget alerts**:
   - Defina um limite mensal (ex: 10 GB de bandwidth)
   - Adicione seu email para alertas
3. Monitore o uso regularmente

### 4. Revise Acessos Regularmente

Use a página **debug.html** para:
- Ver salas ativas
- Limpar salas antigas (&gt;24h)
- Monitorar padrões de uso anormais

## ✅ Checklist de Segurança

- [ ] Configurei regras de segurança no Firebase
- [ ] Adicionei domínios autorizados no Firebase
- [ ] Configurei alertas de uso no Firebase
- [ ] Monitoro salas e uso regularmente via debug.html
- [ ] Limpo salas antigas periodicamente

## 🎯 Boas Práticas

### FAÇA:
- Configure regras de segurança restritivas no Firebase
- Limite domínios autorizados
- Monitore uso regularmente
- Use a página de debug para manutenção
- Configure alertas de billing

### NÃO FAÇA:
- Compartilhar credenciais em mensagens ou emails
- Usar as mesmas credenciais em múltiplos projetos
- Ignorar alertas de uso anormal
- Deixar regras de segurança abertas em produção

## 📚 Referências

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Best Practices](https://firebase.google.com/docs/web/best-practices)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
