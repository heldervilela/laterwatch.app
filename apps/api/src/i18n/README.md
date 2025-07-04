# Sistema de Internacionalização (i18n)

## 📋 Visão Geral

Sistema thread-safe de tradução que suporta Português de Portugal (PT) e Inglês (EN) com detecção automática de idioma via header `Accept-Language`.

## 🏗️ Estrutura

```
src/i18n/
├── locales/
│   ├── pt.ts              # Traduções em português de Portugal (padrão)
│   └── en.ts              # Traduções em inglês
├── index.ts               # Funções principais de tradução
└── README.md              # Esta documentação
```

## 🎯 Como Funciona

### 1. **Detecção Automática de Idioma**

O sistema detecta automaticamente o idioma preferido através do header HTTP `Accept-Language`:

```http
Accept-Language: pt-PT,pt;q=0.9,en;q=0.8
Accept-Language: en-US,en;q=0.9,pt;q=0.8
```

### 2. **Context per Request**

Cada request tem seu próprio context com tradutor específico:

```typescript
// Context criado automaticamente
{
  locale: 'pt' | 'en',
  t: (key: string) => string,  // Função de tradução
  user: User | null
}
```

### 3. **Thread-Safe**

- ✅ Sem estado global mutável
- ✅ Cada request isolado
- ✅ Funciona em ambiente multi-thread

## 📖 Como Usar

### Em tRPC Procedures

```typescript
export const myProcedure = publicProcedure.mutation(async ({ ctx }) => {
  // ✅ Usar função de tradução do context
  const message = ctx.t('auth.success.loginSuccess')

  return {
    success: true,
    message, // Traduzido automaticamente
  }
})
```

### Em Services

```typescript
// ❌ NÃO fazer - não thread-safe
const message = translate('pt', 'auth.errors.invalidEmail');

// ✅ Fazer - retornar keys
async sendCode(email: string) {
  return {
    success: false,
    messageKey: 'auth.errors.invalidEmail', // Key, não string
  };
}

// ✅ Tradução acontece no procedure
.mutation(async ({ ctx }) => {
  const result = await service.sendCode(email);

  return {
    success: result.success,
    message: ctx.t(result.messageKey), // Traduzir aqui
  };
});
```

## 🔧 Adicionando Novas Traduções

### 1. **Adicionar em pt.ts**

```typescript
export const pt = {
  // ... existing translations
  newFeature: {
    success: {
      created: 'Item criado com sucesso',
      updated: 'Item actualizado com sucesso',
    },
    errors: {
      notFound: 'Item não encontrado',
    },
  },
}
```

### 2. **Adicionar em en.ts**

```typescript
export const en: LocaleStructure = {
  // ... existing translations
  newFeature: {
    success: {
      created: 'Item created successfully',
      updated: 'Item updated successfully',
    },
    errors: {
      notFound: 'Item not found',
    },
  },
}
```

### 3. **Atualizar LocaleStructure**

```typescript
// em pt.ts
export type LocaleStructure = {
  // ... existing structure
  newFeature: {
    success: {
      created: string
      updated: string
    }
    errors: {
      notFound: string
    }
  }
}
```

## 🧪 Como Testar

### Português de Portugal (Padrão)

```bash
curl -H "Accept-Language: pt-PT" http://localhost:3001/rpc/...
curl -H "Accept-Language: pt" http://localhost:3001/rpc/...
```

### Inglês

```bash
curl -H "Accept-Language: en-US" http://localhost:3001/rpc/...
curl -H "Accept-Language: en-GB" http://localhost:3001/rpc/...
```

### Sem Header

```bash
curl http://localhost:3001/rpc/...  # Usa PT como padrão
```

## 📝 Convenções

### 1. **Estrutura de Keys**

```
domain.type.specificMessage

Exemplos:
- auth.errors.invalidEmail
- auth.success.loginSuccess
- validation.required
- user.success.profileLoaded
```

### 2. **Naming**

- **Domínios**: `auth`, `user`, `validation`
- **Tipos**: `errors`, `success`, `warnings`
- **Mensagens**: camelCase descritivo

### 3. **Services**

- Sempre retornar `messageKey` em vez de strings
- Tradução acontece na camada de apresentação (procedures)

### 4. **Português de Portugal**

- Usar "utilizador" em vez de "usuário"
- Usar "actualizar" em vez de "atualizar"
- Usar "início/término de sessão" em vez de "login/logout"
- Usar "demasiado" em vez de "muito"

## 🚀 Benefícios

- ✅ **Thread-Safe**: Funciona em qualquer ambiente
- ✅ **Type-Safe**: TypeScript garante que traduções existem
- ✅ **Automatic**: Detecção automática de idioma
- ✅ **Scalable**: Fácil adicionar novos idiomas
- ✅ **Testable**: Fácil testar com diferentes locales
- ✅ **Performance**: Zero overhead em runtime

## 🌍 **Idiomas Suportados:**

- **🇵🇹 Português de Portugal** (padrão)
- **🇺🇸 Inglês**
