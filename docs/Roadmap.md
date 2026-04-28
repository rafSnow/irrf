# Roadmap — App de Gestão Fiscal IRPF 2027

> **Projeto:** Guardião Fiscal  
> **Versão:** 1.0  
> **Data de início:** Maio de 2026  
> **Metodologia:** Scrum adaptado para time solo/pequeno — sprints de 2 semanas  
> **Meta final:** App estável em produção até 31 de dezembro de 2026, pronto para coleta do ano-base 2026 completo

---

## Visão Geral das Fases

| Fase | Período | Objetivo |
|------|---------|----------|
| Fase 1 — Fundação | Sprints 1–2 (maio) | Infraestrutura, autenticação e armazenamento local |
| Fase 2 — MVP Core | Sprints 3–4 (junho) | Captura, OCR e listagem de documentos |
| Fase 3 — Inteligência Fiscal | Sprints 5–6 (julho) | Dashboard, totais, linha do tempo e checklist |
| Fase 4 — Segurança e Backup | Sprint 7 (agosto) | Criptografia, backup e exportação PDF |
| Fase 5 — Refinamento | Sprint 8 (agosto–setembro) | Polimento de UX, notificações e modo escuro |
| Fase 6 — Estabilização | Sprint 9 (outubro) | Testes, acessibilidade e auditoria de segurança |
| Fase 7 — Lançamento | Sprint 10 (novembro) | Deploy, documentação e preparação para janeiro/2027 |

**Referência de datas:**
- Declaração do IRPF 2027 (ano-base 2026): prevista para março–junho de 2027.
- Para coletar documentos do ano completo de 2026, o app precisa estar operacional idealmente desde janeiro/2026. Como o desenvolvimento inicia em maio/2026, o histórico de janeiro–abril deve ser importado retroativamente pelo usuário (via upload manual) assim que o app estiver disponível.

---

## Sprint 1 — Fundação e Setup

**Período:** 04 a 17 de maio de 2026 (2 semanas)  
**Objetivo:** Ambiente configurado, autenticação funcional e estrutura de banco de dados criada.

### Entregas

**Configuração do projeto**
- Inicializar projeto Vite + React + TypeScript.
- Configurar Tailwind CSS, ESLint e Prettier.
- Configurar `vite-plugin-pwa` com manifest básico (nome, ícones, cores).
- Configurar Service Worker com Workbox (estratégias de cache definidas).
- Configurar GitHub Actions para deploy automático no GitHub Pages.
- Configurar `vitest` para testes unitários.

**Banco de dados local**
- Instalar e configurar Dexie.js.
- Criar schema inicial (tabelas `documents`, `categories`, `checklist`, `settings`).
- Criar migration `v1` com categorias padrão do IRPF pré-cadastradas.
- Criar repositories: `documentRepository`, `categoryRepository`, `settingsRepository`.
- Testes unitários para os repositories.

**Autenticação — PIN**
- Tela de onboarding: criação de PIN de 6 dígitos.
- Tela de desbloqueio com PIN.
- `pinService`: hash do PIN com Web Crypto (PBKDF2 + SHA-256 + salt).
- Verificação do PIN no login; bloqueio após 5 tentativas erradas.
- `AuthProvider` com contexto de sessão (autenticado/bloqueado).
- Bloqueio automático após 5 minutos de inatividade.

### Critérios de Conclusão da Sprint 1
- App instala como PWA no Chrome (desktop e Android).
- Tela de PIN aparece ao abrir o app.
- Login com PIN correto libera acesso à tela principal (em branco).
- PIN errado 5 vezes bloqueia com mensagem adequada.
- 0 erros de lint; pipeline do GitHub Actions executando com sucesso.

---

## Sprint 2 — Autenticação Completa e PWA Sólido

**Período:** 18 a 31 de maio de 2026 (2 semanas)  
**Objetivo:** Autenticação por biometria (WebAuthn), funcionamento offline validado e layout base da interface.

### Entregas

**Autenticação — Biometria**
- `webAuthnService`: cadastro de credencial biométrica (TouchID, FaceID, sensor Android).
- Integração do WebAuthn na tela de desbloqueio como opção primária.
- Fallback para PIN quando biometria não está disponível ou falha.
- Opção nas configurações para ativar/desativar biometria.

**PWA e Offline**
- Validar funcionamento completo offline: abrir app, navegar, (mock de) listar documentos.
- Implementar indicador visual de status de conexão (meramente informativo).
- Testar instalação no iOS via "Adicionar à tela inicial" e validar comportamento.
- Monitorar cota de armazenamento (`navigator.storage.estimate()`) e exibir aviso quando > 80%.

**Layout e Navegação Base**
- Estrutura de navegação principal: Dashboard, Documentos, Checklist, Configurações.
- Componentes base reutilizáveis: `Button`, `Modal`, `Card`, `Badge`, `Input`, `Spinner`.
- Layout responsivo validado em 375px (mobile) e 1280px (desktop).
- Tela de Configurações com: informações de armazenamento e opção de logout.

### Critérios de Conclusão da Sprint 2
- Desbloqueio por biometria funciona no Android (Chrome) e iOS (Safari).
- App abre e navega normalmente com Wi-Fi desligado.
- Navegação entre as 4 telas principais funciona sem erros.
- Layout responsivo validado nos breakpoints mobile e desktop.

---

## Sprint 3 — Captura de Documentos

**Período:** 01 a 14 de junho de 2026 (2 semanas)  
**Objetivo:** Usuário consegue fotografar ou fazer upload de um documento e vê ele listado na tela de Documentos.

### Entregas

**Câmera**
- Componente `CameraCapture`: aciona `MediaDevices.getUserMedia()`.
- Seleção de câmera traseira/frontal no mobile.
- Preview da foto capturada com opções "Refazer" e "Usar essa".
- Tratamento de erro: câmera negada, câmera não disponível (desktop sem webcam).

**Upload de arquivos**
- Componente `FileUpload`: seletor nativo + drag-and-drop.
- Suporte aos formatos: `.pdf`, `.jpg`, `.jpeg`, `.png`, `.heic`, `.webp`.
- Validação de tamanho máximo (20 MB).
- Preview: imagem direta para fotos, ícone + nome do arquivo para PDFs.
- Conversão de HEIC para JPEG no cliente (biblioteca `heic2any`).

**Formulário de cadastro de documento**
- Campos: título, emitente, valor (R$), data, categoria, observações.
- Máscara de moeda no campo de valor.
- Datepicker para o campo de data.
- Validação de campos obrigatórios: categoria e data são required.
- `documentService.create()`: salva no IndexedDB (sem criptografia ainda — será adicionada na Sprint 7).

**Listagem de documentos**
- Tela Documentos: lista de `DocumentCard` em ordem cronológica decrescente.
- Cada card exibe: miniatura, título, emitente, valor, data, categoria (com cor).
- Estado vazio: ilustração e CTA para adicionar o primeiro documento.
- Skeleton loading durante carregamento do IndexedDB.

### Critérios de Conclusão da Sprint 3
- Usuário consegue fotografar um recibo e salvá-lo categorizado.
- Usuário consegue fazer upload de um PDF e salvá-lo.
- Documento aparece na lista imediatamente após salvar.
- Formulário valida campos obrigatórios e exibe erros inline.

---

## Sprint 4 — OCR e Gestão de Documentos

**Período:** 15 a 28 de junho de 2026 (2 semanas)  
**Objetivo:** OCR automático preenche os campos do formulário; usuário pode editar, detalhar e excluir documentos.

### Entregas

**OCR com Tesseract.js**
- Instalar Tesseract.js com worker em língua portuguesa.
- `ocrService.extractFromImage()`: retorna `{ amount, date, issuer }` com confiança.
- Hook `useOcr`: gerencia estado do processamento (idle, processing, success, error).
- Pré-carregamento do WASM do Tesseract no Service Worker (cache automático).
- Progresso visual durante o OCR (barra de progresso com tempo estimado).
- Pré-preenchimento dos campos do formulário com dados extraídos.
- Indicador "Preenchido por OCR" nos campos auto-detectados.
- Testes unitários para o parsing de valores monetários e datas do OCR.

**Busca e Filtros**
- Barra de busca na tela de Documentos: busca em tempo real por título e emitente.
- Filtro por categoria (chips selecionáveis).
- Filtro por período: mês, trimestre, semestre, ano.
- Ordenação: data (desc/asc), valor (maior/menor).
- Persistência dos filtros ativos durante a sessão.

**Tela de detalhe e edição**
- Tela de detalhe: visualização ampliada da imagem/PDF, todos os metadados.
- Botão editar: reabre o formulário com dados preenchidos.
- Exclusão: confirmação modal + remoção do IndexedDB.

### Critérios de Conclusão da Sprint 4
- OCR processa uma foto de recibo e preenche valor e data corretamente em >70% dos casos.
- Filtro por categoria e período funciona combinado.
- Busca textual retorna resultados em < 300ms.
- Edição e exclusão de documento funcionam sem recarregar a página.

---

## Sprint 5 — Dashboard e Painel Fiscal

**Período:** 29 de junho a 12 de julho de 2026 (2 semanas)  
**Objetivo:** Tela inicial com visão completa do progresso fiscal: totais, limites e linha do tempo.

### Entregas

**Cards de totais por categoria**
- Um card por categoria com: total acumulado (R$), quantidade de documentos, limite dedutível (quando aplicável).
- Barra de progresso visual: preenchimento proporcional ao limite dedutível.
- Alerta visual (cor âmbar) quando > 80% do limite atingido.
- Alerta (cor verde) com destaque quando limite ultrapassado (saúde: sem limite — exibir total).
- Dados reativos: atualizam imediatamente ao adicionar/remover documentos.

**Linha do tempo anual**
- Grade com 12 meses do ano fiscal (2026).
- Cada célula mensal: quantidade de documentos e valor total acumulado no mês.
- Destaque visual (cor cinza) para meses sem documentos.
- Indicador do mês atual.
- Clique no mês: navega para Documentos com filtro do mês ativo.
- Meses futuros exibidos em estado "a coletar".

**Métricas de resumo no topo do Dashboard**
- Total geral acumulado (todas as categorias).
- Projeção de restituição estimada (cálculo simplificado com tabela IRPF vigente).
- Quantidade total de documentos.
- Percentual de completude do checklist.

### Critérios de Conclusão da Sprint 5
- Dashboard carrega em < 1 segundo com 200 documentos de teste no IndexedDB.
- Barra de progresso da categoria Educação trava no máximo ao atingir o limite legal.
- Clique no mês na linha do tempo filtra a lista de documentos corretamente.
- Projeção de restituição exibe valor coerente com os dados cadastrados.

---

## Sprint 6 — Checklist e Notificações

**Período:** 13 a 26 de julho de 2026 (2 semanas)  
**Objetivo:** Checklist de documentos do IRPF e sistema de alertas dentro do app.

### Entregas

**Checklist de documentos**
- Tela Checklist com lista dos principais documentos do IRPF (pré-configurados).
- Itens padrão: informes de rendimento (empregador, banco, corretora), recibos de saúde, comprovantes de educação, PGBL, INSS autônomo, carnê-leão, aluguel, doações.
- Status por item: Pendente, Obtido, Não se aplica.
- Percentual de completude exibido no topo e no Dashboard.
- Adicionar itens personalizados.
- Remover itens que não se aplicam ao perfil do usuário.
- Persistência no IndexedDB (tabela `checklist`).

**Notificações e alertas in-app**
- Banner de alerta no Dashboard quando checklist < 50% completo.
- Alerta sazonal: ao abrir o app em janeiro/fevereiro, lembrete para buscar informes de rendimento.
- Alerta de prazo: ao abrir em março/abril, lembrete do período de entrega da declaração.
- Alerta de mês sem documentos: aviso sutil quando o mês atual não tem nenhum documento cadastrado após o dia 15.
- Configuração nas Preferências para ativar/desativar cada tipo de alerta.

**Melhorias na UX**
- Swipe-to-delete no mobile para remover documento da lista (com confirmação).
- Ordenação de documentos por drag-and-drop (dentro da mesma categoria).
- Compartilhamento de documento individual via `navigator.share()`.

### Critérios de Conclusão da Sprint 6
- Checklist exibe os itens padrão corretamente categorizados.
- Marcar item como "Obtido" reflete no percentual do Dashboard imediatamente.
- Alerta de informe de rendimento aparece ao simular abertura do app em fevereiro.
- Swipe-to-delete funciona no Chrome (Android) e Safari (iOS).

---

## Sprint 7 — Criptografia e Backup

**Período:** 27 de julho a 09 de agosto de 2026 (2 semanas)  
**Objetivo:** Dados dos documentos protegidos por criptografia local; backup exportável e restaurável.

### Entregas

**Criptografia AES-256-GCM**
- `encryptionService.ts`: wrapper sobre Web Crypto API.
  - `encrypt(blob: ArrayBuffer, key: CryptoKey): Promise<ArrayBuffer>` — criptografa o arquivo com IV aleatório prefixado.
  - `decrypt(encryptedBlob: ArrayBuffer, key: CryptoKey): Promise<ArrayBuffer>` — descriptografa para exibição.
  - `deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey>` — PBKDF2 com 100k iterações.
- Migração: documentos já cadastrados nas sprints anteriores são criptografados retroativamente na primeira sessão pós-atualização.
- A chave AES fica no `AuthProvider` em memória; é descartada ao bloquear o app.
- Testes unitários para encrypt/decrypt garantindo round-trip fiel.

**Backup local exportável**
- `backupService.ts`:
  - `exportBackup()`: gera ZIP com todos os documentos descriptografados + `metadata.json` com todos os metadados + `checklist.json`.
  - Opção de senha para o ZIP (criptografia do arquivo de backup).
  - Download automático do arquivo `guardiao-fiscal-backup-YYYY-MM-DD.zip`.
  - `importBackup(zipFile: File)`: restaura documentos e metadados, re-criptografa com a chave da sessão atual.
- Tela de Backup nas Configurações: botão Exportar, botão Importar, data do último backup.
- Aviso ao usuário ao abrir Configurações se o último backup foi há > 30 dias.

**Geração de relatório PDF**
- `pdfService.ts` usando jsPDF + html2canvas.
- Conteúdo do relatório: capa com resumo fiscal (totais por categoria + projeção de restituição), listagem de cada documento (data, emitente, valor, categoria), rodapé com data de geração.
- Opção de incluir miniaturas dos documentos no relatório.
- Compartilhamento via `navigator.share()` ou download direto.
- Botão "Gerar relatório para contador" no Dashboard.

### Critérios de Conclusão da Sprint 7
- Documento salvo é armazenado criptografado no IndexedDB (verificar raw bytes no DevTools).
- Descriptografar e exibir imagem funciona sem erros em sessão autenticada.
- Exportar backup gera ZIP com todos os arquivos e metadata.json correto.
- Importar o backup restaura todos os documentos fielmente.
- Relatório PDF gerado contém totais por categoria e lista de documentos.

---

## Sprint 8 — Refinamento de UX e Acessibilidade

**Período:** 10 a 23 de agosto de 2026 (2 semanas)  
**Objetivo:** Experiência polida, modo escuro, acessibilidade e pequenas melhorias de usabilidade.

### Entregas

**Modo escuro**
- Detecção automática via `prefers-color-scheme`.
- Toggle manual de tema nas Configurações.
- Persistência da preferência manual em localStorage.
- Validação de contraste em todos os componentes nos dois temas.

**Acessibilidade (WCAG 2.1 AA)**
- Navegação por teclado completa (Tab, Enter, Escape, setas).
- Roles ARIA em componentes interativos (modal, dropdown, botões de ação).
- Contraste de texto mínimo 4.5:1 validado com ferramenta automatizada.
- Labels em todos os campos de formulário.
- Teste com leitor de tela (VoiceOver no iOS, TalkBack no Android).

**Melhorias de UX baseadas em uso real**
- Onboarding: tela de boas-vindas com 3 passos (instalar → criar PIN → importar primeiros docs).
- Estado de carregamento mais suave (skeleton screens em vez de spinner global).
- Animações de micro-interação: transição ao marcar item do checklist, feedback ao salvar documento.
- Pull-to-refresh na lista de documentos (mobile).
- Tela de configurações reorganizada com seções: Segurança, Backup, Aparência, Sobre.
- Botão de exclusão de todos os dados (com triple-confirmation: PIN obrigatório).

**Performance**
- Lazy loading de rotas (code splitting por página).
- Virtualização da lista de documentos (react-virtual) para listas com > 100 itens.
- Otimização de imagens: compressão client-side antes de salvar (canvas resize para max 2048px).
- Auditoria Lighthouse: meta de 90+ em Performance, Acessibilidade, PWA.

### Critérios de Conclusão da Sprint 8
- Lighthouse score: Performance ≥ 90, Accessibility ≥ 90, PWA ≥ 100.
- Modo escuro ativo sem nenhum elemento com texto ilegível.
- Navegação completa por teclado (Tab + Enter) em todas as telas.
- Lista com 500 documentos simulados rola sem travamento (60fps).

---

## Sprint 9 — Testes, Auditoria e Correções

**Período:** 24 de agosto a 06 de setembro de 2026 (2 semanas)  
**Objetivo:** Cobertura de testes sólida, auditoria de segurança e zero bugs críticos.

### Entregas

**Testes unitários**
- Meta: ≥ 70% de cobertura nas camadas `services`, `repositories` e `utils`.
- Testes para: `encryptionService` (encrypt/decrypt round-trip), `backupService` (export/import), `ocrService` (parsing de valores), `pinService` (hash e verificação), todos os repositories (CRUD).
- Configurar relatório de cobertura no CI (GitHub Actions).

**Testes de integração**
- Fluxo E2E: abrir app → criar PIN → adicionar documento via upload → ver no Dashboard → exportar backup.
- Fluxo E2E: importar backup → verificar documentos restaurados.
- Ferramenta: Playwright (headless Chrome).

**Testes manuais em dispositivos reais**
- iPhone 13 (Safari iOS 17): câmera, biometria (Face ID), instalação PWA.
- Android (Chrome): câmera, biometria (impressão digital), instalação PWA.
- Desktop Windows (Chrome): upload, geração de PDF, backup.
- Desktop macOS (Safari): funcionamento geral.

**Auditoria de segurança**
- `npm audit` — zero vulnerabilidades críticas ou altas.
- Verificar: nenhuma chave ou dado sensível em localStorage não criptografado.
- Verificar: nenhuma requisição de rede durante operações de salvar/ler documentos (DevTools Network).
- Revisão manual do `encryptionService` para garantir que a chave AES não é serializada.
- Content Security Policy (CSP) configurada no HTML para bloquear recursos externos.

**Correções de bugs**
- Sprint reservada para corrigir todos os bugs descobertos nos testes manuais e automatizados.
- Bugs críticos (app crasha, dados perdidos): correção obrigatória antes do lançamento.
- Bugs médios (UX quebrada): correção nesta sprint se possível, ou backlog pós-lançamento.

### Critérios de Conclusão da Sprint 9
- Cobertura de testes ≥ 70% nas camadas de serviço e repositório.
- 0 bugs críticos em aberto.
- `npm audit` sem vulnerabilidades críticas ou altas.
- App funciona nas 4 plataformas testadas (iPhone Safari, Android Chrome, Windows Chrome, macOS Safari).

---

## Sprint 10 — Lançamento e Preparação para 2027

**Período:** 07 a 20 de setembro de 2026 (2 semanas)  
**Objetivo:** Versão 1.0 em produção, documentação finalizada e usuário pronto para usar desde outubro/2026.

### Entregas

**Deploy de produção**
- Tag `v1.0.0` no GitHub com release notes detalhado.
- URL de produção estável e funcional (GitHub Pages ou Netlify).
- Verificar HTTPS, Service Worker ativo e PWA instalável na URL de produção.
- Testar instalação a partir da URL de produção em todos os dispositivos.

**Documentação do usuário**
- README do repositório: o que é o app, como instalar, como usar.
- Guia rápido in-app (tela "Ajuda"): 5 passos para começar.
- FAQ in-app: "Meus dados são enviados para algum servidor?", "O que acontece se eu trocar de celular?", "Como faço backup?".

**Retrospectiva e backlog pós-v1.0**
- Documentar lições aprendidas da Sprint 1 à Sprint 10.
- Backlog de funcionalidades para versão 1.1 (pós-declaração 2027):
  - Sincronização entre dispositivos via arquivo em Google Drive/iCloud (mantendo criptografia).
  - Importação de extratos bancários (OFX/CSV) para detecção automática de despesas médicas.
  - Integração com e-CAC para importar dados da Receita Federal.
  - Suporte a múltiplos perfis (cônjuge com declaração separada).

**Preparação para coleta de janeiro/2027**
- Notificação no app em 01/janeiro/2027 com checklist de início de ano:
  - Buscar informe de rendimentos do empregador.
  - Solicitar informe de rendimentos dos bancos.
  - Verificar se há documentos de dezembro/2026 ainda não cadastrados.

### Critérios de Conclusão da Sprint 10 (Definition of Done do Projeto)
- App acessível na URL de produção com Service Worker ativo.
- Instalação via PWA funciona em iOS (Safari) e Android (Chrome).
- Todos os 18 requisitos funcionais do documento de Requisitos estão implementados ou conscientemente adiados para v1.1 com justificativa registrada.
- Documentação de usuário disponível in-app.
- Backup do estado de produção salvo com senha em local seguro.

---

## Cronograma Resumido

| Sprint | Período | Foco Principal | Status |
|--------|---------|----------------|--------|
| Sprint 1 | 04–17 mai | Setup, IndexedDB, PIN | A iniciar |
| Sprint 2 | 18–31 mai | WebAuthn, PWA offline, navegação | A iniciar |
| Sprint 3 | 01–14 jun | Câmera, upload, listagem | A iniciar |
| Sprint 4 | 15–28 jun | OCR, busca, edição | A iniciar |
| Sprint 5 | 29 jun–12 jul | Dashboard, linha do tempo | A iniciar |
| Sprint 6 | 13–26 jul | Checklist, notificações | A iniciar |
| Sprint 7 | 27 jul–09 ago | Criptografia, backup, PDF | A iniciar |
| Sprint 8 | 10–23 ago | UX, modo escuro, acessibilidade | A iniciar |
| Sprint 9 | 24 ago–06 set | Testes, auditoria, bugs | A iniciar |
| Sprint 10 | 07–20 set | Lançamento, documentação | A iniciar |

**Buffer:** Outubro a dezembro de 2026 reservado para correções pós-lançamento e melhorias menores baseadas no uso real.

---

## Métricas de Sucesso

Ao final do projeto (dezembro de 2026), o app será considerado bem-sucedido se:

1. O usuário consegue abrir, usar e fechar o app sem internet em qualquer momento.
2. Pelo menos 80% dos documentos de saúde, educação e renda do ano de 2026 estão cadastrados.
3. A geração do relatório PDF para o contador funciona sem erros.
4. Nenhum dado foi perdido por falta de backup ou por bug do app.
5. O app está instalado como PWA no celular principal do usuário e é acessado ao menos uma vez por semana.

---

*Documento gerado em abril de 2026. Atualizar status das sprints semanalmente.*
