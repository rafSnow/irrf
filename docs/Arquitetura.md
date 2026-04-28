# Arquitetura — App de Gestão Fiscal IRPF 2027

> **Projeto:** Guardião Fiscal  
> **Versão:** 1.0  
> **Data:** Abril de 2026  
> **Paradigma:** Offline-first PWA, Client-side only, Zero-backend

---

## 1. Visão Geral da Arquitetura

O Guardião Fiscal é uma aplicação **100% client-side**. Não existe servidor de aplicação, banco de dados remoto, API REST própria ou qualquer serviço de nuvem no caminho entre o usuário e seus dados. Toda a computação acontece no dispositivo.

```
┌─────────────────────────────────────────────────────────────┐
│                      DISPOSITIVO DO USUÁRIO                 │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │  Navegador   │   │ Service      │   │  IndexedDB     │  │
│  │  (Chrome /   │◄──│ Worker       │   │  (Documentos + │  │
│  │   Safari /   │   │ (Workbox)    │   │   Metadados)   │  │
│  │   Firefox)   │   └──────────────┘   └────────────────┘  │
│  │              │                                           │
│  │  React PWA   │   ┌──────────────┐   ┌────────────────┐  │
│  │  (UI + Lógica│◄──│ Tesseract.js │   │  Web Crypto    │  │
│  │   de negócio)│   │ (OCR local)  │   │  (AES-256-GCM) │  │
│  └──────────────┘   └──────────────┘   └────────────────┘  │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │ MediaDevices │   │  jsPDF +     │   │  WebAuthn      │  │
│  │ (Câmera)     │   │  html2canvas │   │  (Biometria)   │  │
│  └──────────────┘   └──────────────┘   └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                    (Deploy estático)
                            │
              ┌─────────────▼──────────────┐
              │   GitHub Pages / Netlify    │
              │   (apenas arquivos estáticos│
              │    HTML, JS, CSS, WASM)     │
              └─────────────────────────────┘
```

O servidor de hospedagem serve apenas os arquivos estáticos da aplicação (HTML, JS, CSS, WebAssembly). Após o carregamento inicial, o Service Worker intercepta todas as requisições e o app opera completamente offline.

---

## 2. Stack Tecnológica

### 2.1 Frontend

| Camada | Tecnologia | Versão | Justificativa |
|--------|------------|--------|---------------|
| Framework UI | React | 18.x | Ecossistema maduro, hooks para gerenciamento de estado local, excelente suporte a PWA via Vite |
| Bundler | Vite | 5.x | Build rápido, plugin oficial para PWA (vite-plugin-pwa), suporte a WASM nativo |
| Plugin PWA | vite-plugin-pwa | 0.20.x | Geração automática de Service Worker com Workbox, manifest configurável |
| Linguagem | TypeScript | 5.x | Tipagem estática reduz bugs em lógica de negócio complexa (criptografia, IndexedDB) |
| Estilo | Tailwind CSS | 3.x | Utilitário, sem CSS externo, gera apenas o que é usado (bundle pequeno) |

### 2.2 Armazenamento Local

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Banco de dados local | IndexedDB (via Dexie.js 3.x) | API reativa sobre IndexedDB, suporte a transações, queries tipadas com TypeScript |
| Cache de assets | Cache API (via Workbox) | Estratégia Cache-First para assets estáticos, garantindo funcionamento offline |
| Preferências do app | localStorage | Para configurações simples (tema, preferência de idioma) que não exigem criptografia |

### 2.3 Segurança e Criptografia

| Recurso | Tecnologia | Detalhe |
|---------|------------|---------|
| Criptografia de documentos | Web Crypto API (nativa) | AES-256-GCM para criptografar blobs de imagem/PDF antes de salvar no IndexedDB |
| Derivação de chave | PBKDF2 (Web Crypto) | Gera a chave AES a partir do PIN do usuário com 100.000 iterações e salt único |
| Autenticação biométrica | WebAuthn API (nativa) | Integração com biometria do dispositivo (Touch ID, Face ID, sensor de impressão digital) |
| Fallback de autenticação | PIN de 6 dígitos | Implementado em JS puro; hash do PIN armazenado com bcrypt-like via Web Crypto |

### 2.4 Funcionalidades Nativas do Navegador

| Funcionalidade | API | Suporte |
|----------------|-----|---------|
| Câmera | `MediaDevices.getUserMedia()` | Chrome, Firefox, Safari 14.5+ |
| Compartilhamento | `navigator.share()` | Chrome (Android/Desktop), Safari. Fallback para download direto |
| Notificações | `Notifications API` | Chrome, Firefox. Safari com limitações |
| Instalação do PWA | `beforeinstallprompt` | Chrome/Edge. iOS via "Adicionar à tela inicial" |
| Armazenamento | `navigator.storage.estimate()` | Para monitorar cota disponível |

### 2.5 Bibliotecas de Terceiros

| Biblioteca | Versão | Uso | Execução |
|------------|--------|-----|----------|
| Dexie.js | 3.x | ORM para IndexedDB | Client-side |
| Tesseract.js | 5.x | OCR em português | Client-side (WASM) |
| jsPDF | 2.x | Geração de PDF | Client-side |
| html2canvas | 1.x | Captura de tela para PDF | Client-side |
| JSZip | 3.x | Compactação do backup | Client-side |
| Workbox | 7.x | Service Worker (via plugin Vite) | Service Worker |
| Lucide React | latest | Ícones SVG | Client-side |

---

## 3. Estrutura de Diretórios

```
guardiao-fiscal/
├── public/
│   ├── icons/                  # Ícones PWA (192px, 512px, maskable)
│   ├── manifest.webmanifest    # Manifest do PWA
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── App.tsx             # Componente raiz, roteamento
│   │   └── providers/
│   │       ├── AuthProvider.tsx        # Contexto de autenticação (PIN/WebAuthn)
│   │       ├── DatabaseProvider.tsx    # Contexto do banco IndexedDB
│   │       └── ThemeProvider.tsx       # Contexto de tema
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── PinScreen.tsx
│   │   │   │   └── BiometricPrompt.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── services/
│   │   │       ├── pinService.ts       # Lógica de PIN (hash, verificação)
│   │   │       └── webAuthnService.ts  # Lógica de biometria
│   │   ├── documents/
│   │   │   ├── components/
│   │   │   │   ├── DocumentCard.tsx
│   │   │   │   ├── DocumentList.tsx
│   │   │   │   ├── DocumentForm.tsx    # Formulário de cadastro/edição
│   │   │   │   ├── CameraCapture.tsx   # Componente de câmera
│   │   │   │   └── FileUpload.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useDocuments.ts
│   │   │   │   ├── useCamera.ts
│   │   │   │   └── useOcr.ts           # Hook para OCR com Tesseract.js
│   │   │   └── services/
│   │   │       ├── documentService.ts  # CRUD de documentos
│   │   │       ├── ocrService.ts       # Wrapper Tesseract.js
│   │   │       └── encryptionService.ts# Criptografia AES-256-GCM
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── CategoryCard.tsx    # Card de total por categoria
│   │   │   │   ├── AnnualTimeline.tsx  # Grade mensal
│   │   │   │   └── ProgressBar.tsx     # Limite dedutível
│   │   │   └── hooks/
│   │   │       └── useDashboard.ts
│   │   ├── backup/
│   │   │   ├── components/
│   │   │   │   └── BackupRestore.tsx
│   │   │   └── services/
│   │   │       └── backupService.ts    # Export/import ZIP
│   │   ├── reports/
│   │   │   ├── components/
│   │   │   │   └── ReportGenerator.tsx
│   │   │   └── services/
│   │   │       └── pdfService.ts       # Geração de PDF com jsPDF
│   │   └── checklist/
│   │       ├── components/
│   │       │   └── Checklist.tsx
│   │       └── data/
│   │           └── defaultChecklist.ts # Itens padrão do IRPF
│   ├── shared/
│   │   ├── components/             # Componentes reutilizáveis (Button, Modal, etc.)
│   │   ├── hooks/                  # Hooks genéricos (useStorage, useNetwork)
│   │   ├── types/                  # Tipos TypeScript globais
│   │   │   ├── document.ts
│   │   │   ├── category.ts
│   │   │   └── backup.ts
│   │   └── utils/                  # Funções utilitárias puras
│   │       ├── formatters.ts       # Formatação de moeda, data
│   │       └── validators.ts       # Validações de formulário
│   ├── db/
│   │   ├── database.ts             # Instância e configuração do Dexie.js
│   │   ├── migrations/             # Migrations de schema do IndexedDB
│   │   │   └── v1.ts
│   │   └── repositories/           # Camada de acesso a dados
│   │       ├── documentRepository.ts
│   │       ├── categoryRepository.ts
│   │       └── settingsRepository.ts
│   └── sw/
│       └── service-worker.ts       # Service Worker customizado (via Workbox)
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   └── integration/
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Modelo de Dados

### 4.1 Schema do IndexedDB (Dexie.js)

**Tabela: `documents`**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` (UUID v4) | Identificador único do documento |
| `categoryId` | `string` | Referência à categoria (FK lógica) |
| `title` | `string` | Título/descrição do documento |
| `issuer` | `string` | Nome do emitente (ex.: "Hospital Albert Einstein") |
| `amount` | `number` | Valor em centavos (inteiro para evitar float) |
| `documentDate` | `string` | Data do documento (ISO 8601: YYYY-MM-DD) |
| `createdAt` | `string` | Data de cadastro no app (ISO 8601) |
| `updatedAt` | `string` | Última atualização (ISO 8601) |
| `fileBlob` | `ArrayBuffer` | Arquivo criptografado (imagem ou PDF) |
| `fileMimeType` | `string` | MIME type original (ex.: `image/jpeg`) |
| `fileName` | `string` | Nome original do arquivo |
| `ocrExtracted` | `boolean` | Indica se os dados foram extraídos por OCR |
| `notes` | `string?` | Observações adicionais do usuário |
| `tags` | `string[]` | Tags personalizadas opcionais |

**Tabela: `categories`**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | Identificador único |
| `name` | `string` | Nome da categoria (ex.: "Saúde") |
| `icon` | `string` | Nome do ícone Lucide |
| `color` | `string` | Cor em HEX para UI |
| `deductionLimit` | `number?` | Limite anual dedutível em centavos (null = ilimitado) |
| `isDefault` | `boolean` | Categoria pré-configurada (não pode ser excluída) |

**Tabela: `checklist`**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | Identificador único |
| `label` | `string` | Descrição do item (ex.: "Informe de rendimentos do empregador") |
| `status` | `'pending' \| 'done' \| 'na'` | Estado atual |
| `categoryId` | `string?` | Categoria relacionada |
| `isCustom` | `boolean` | Item adicionado pelo usuário |

**Tabela: `settings`**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `key` | `string` | Chave única da configuração |
| `value` | `unknown` | Valor (JSON serializable) |

Índices do Dexie: `documents` indexado por `categoryId`, `documentDate`, `createdAt`, `amount`.

---

## 5. Fluxo de Criptografia

```
PIN do usuário (6 dígitos)
        │
        ▼
PBKDF2 (100.000 iterações, SHA-256, salt único por dispositivo)
        │
        ▼
Chave AES-256-GCM (256 bits)
        │
        ├──► Criptografar blob do arquivo (IV aleatório por arquivo)
        │           │
        │           ▼
        │    ArrayBuffer criptografado → IndexedDB
        │
        └──► Hash do PIN → IndexedDB (settings) [para verificação de login]
```

**Regras:**
- O salt é gerado uma única vez (instalação do app) e armazenado em texto plano no IndexedDB. Não é segredo — sua função é tornar o hash único por dispositivo.
- O IV (Initialization Vector) do AES-GCM é gerado aleatoriamente para cada arquivo criptografado e armazenado junto ao ciphertext.
- A chave AES **nunca é persistida** — é derivada do PIN em memória a cada sessão e descartada ao bloquear o app.
- Em sessão ativa, a chave fica em memória no `AuthProvider` e é passada para o `encryptionService` sob demanda.

---

## 6. Fluxo do Service Worker (Offline-First)

```
Usuário acessa o app
        │
        ▼
Service Worker intercepta a requisição
        │
        ├── Asset estático (JS, CSS, WASM, ícone)?
        │       └──► Cache-First → retorna do cache, atualiza em background
        │
        └── Requisição de rede externa?
                └──► Network-only (raramente ocorre — app é autossuficiente)
```

**Estratégias Workbox:**

| Tipo de recurso | Estratégia |
|-----------------|------------|
| HTML principal (`index.html`) | NetworkFirst com fallback para cache |
| Assets estáticos (JS, CSS) | CacheFirst (hash no nome do arquivo garante invalidação) |
| WASM do Tesseract | CacheFirst (arquivo grande, raramente muda) |
| Fontes | StaleWhileRevalidate |

---

## 7. Fluxo de Autenticação

```
App abre
    │
    ▼
Existe PIN cadastrado?
    │
    ├── Não → Tela de criação de PIN (onboarding)
    │               └──► Deriva chave AES → salva hash do PIN → libera acesso
    │
    └── Sim → Tela de desbloqueio
                    │
                    ├── WebAuthn disponível e cadastrado?
                    │       └──► Prompt biométrico → sucesso → deriva chave AES → libera
                    │
                    └── PIN manual
                            │
                            ├── PIN correto → deriva chave AES → libera acesso
                            └── PIN errado (≤5x) → incrementa contador
                                        └── 5 erros → tela de recuperação via backup
```

---

## 8. Fluxo de Captura de Documento

```
Usuário toca "Novo documento"
        │
        ├── "Fotografar" → MediaDevices.getUserMedia() → Preview → Confirmar
        │
        └── "Upload" → File Picker → Preview → Confirmar
                │
                ▼
        OCR automático (Tesseract.js)
                │
                ▼
        Pré-preenchimento: valor, data, emitente
                │
                ▼
        Usuário revisa e completa (categoria, título, notas)
                │
                ▼
        encryptionService.encrypt(blob, chaveAES)
                │
                ▼
        documentRepository.save(documentCriptografado)
                │
                ▼
        Dashboard atualizado em tempo real
```

---

## 9. Estratégia de Deploy

O app é um conjunto de arquivos estáticos e pode ser hospedado em qualquer CDN ou servidor de arquivos simples.

**Opção recomendada: GitHub Pages (gratuito)**
- Repositório público no GitHub.
- GitHub Actions faz o build (`npm run build`) e publica a pasta `dist/` automaticamente a cada push na branch `main`.
- URL: `https://seu-usuario.github.io/guardiao-fiscal`
- HTTPS nativo (obrigatório para PWA e APIs de câmera/WebAuthn).

**Alternativa: Netlify**
- Deploy automático via integração com GitHub.
- Preview de branches para testar antes de publicar.
- URL personalizada gratuita.

**Configuração de HTTPS:** Obrigatório para o funcionamento de Service Workers, MediaDevices API (câmera) e WebAuthn (biometria). Ambas as opções acima fornecem HTTPS por padrão.

---

## 10. Decisões Arquiteturais (ADRs)

### ADR-01: Sem backend próprio
**Decisão:** Arquitetura 100% client-side, sem servidor de aplicação.  
**Motivo:** Privacidade absoluta dos dados fiscais. Elimina custo de infraestrutura e risco de vazamento de dados por breach no servidor.  
**Trade-off:** Sem sincronização entre dispositivos. Backup manual é responsabilidade do usuário.

### ADR-02: IndexedDB com Dexie.js em vez de SQLite (via WASM)
**Decisão:** Usar IndexedDB nativo com abstração Dexie.js.  
**Motivo:** IndexedDB é API nativa de todos os navegadores, sem dependência de WASM adicional. Dexie oferece API reativa e tipagem TypeScript de qualidade. SQLite-WASM adicionaria 1,5 MB ao bundle.  
**Trade-off:** IndexedDB não suporta queries SQL complexas. Para este domínio, os filtros necessários são simples o suficiente para a API do Dexie.

### ADR-03: Tesseract.js para OCR local em vez de API externa
**Decisão:** OCR processado 100% no dispositivo com Tesseract.js (WASM).  
**Motivo:** Dados fiscais não podem ser enviados para APIs de OCR externas (Google Vision, AWS Textract). Privacidade é inegociável.  
**Trade-off:** Tempo de processamento de 5 a 15 segundos por imagem. Arquivo WASM de ~10 MB no primeiro carregamento (cacheado pelo Service Worker).

### ADR-04: React em vez de framework mais leve (Svelte, Vue)
**Decisão:** React 18 com TypeScript.  
**Motivo:** Maior ecossistema de bibliotecas compatíveis (Dexie React hooks, Lucide React). Maior facilidade de encontrar suporte e colaboradores futuros.  
**Trade-off:** Bundle inicial ligeiramente maior que alternativas mais leves.

### ADR-05: Criptografia com Web Crypto API nativa em vez de biblioteca JS
**Decisão:** Usar a Web Crypto API nativa do navegador.  
**Motivo:** Implementação auditada pelos próprios fabricantes de navegadores. Zero dependência externa. Performance superior (execução nativa, não em JS).  
**Trade-off:** API de baixo nível, mais verbosa. Mitigado com a criação do `encryptionService.ts` que encapsula a complexidade.

---

*Documento gerado em abril de 2026. Revisão prevista ao final de cada sprint.*
