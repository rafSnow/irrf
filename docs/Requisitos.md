# Requisitos — App de Gestão Fiscal IRPF 2027

> **Projeto:** Guardião Fiscal  
> **Versão:** 1.0  
> **Data:** Abril de 2026  
> **Autor:** Usuário / Claude (Anthropic)  
> **Escopo:** Aplicação PWA offline-first para coleta, organização e gestão de documentos fiscais visando a declaração do IRPF 2027 (ano-base 2026).

---

## 1. Visão Geral do Produto

O **Guardião Fiscal** é um Progressive Web App (PWA) instalável em dispositivos móveis e desktop, sem dependência de nuvem. Todos os dados — documentos, fotos, metadados e configurações — são armazenados exclusivamente no dispositivo do usuário. O produto tem um único perfil de usuário (pessoa física) e deve estar operacional para coleta de documentos a partir de janeiro de 2026, culminando na declaração do IRPF em 2027.

### 1.1 Objetivos de Negócio

- Maximizar a restituição do IRPF por meio da organização sistemática de comprovantes dedutíveis ao longo do ano.
- Eliminar a perda de documentos físicos e digitais que reduzem as deduções na declaração.
- Garantir privacidade total: nenhum dado fiscal sensível trafega pela internet ou é armazenado em servidores de terceiros.
- Oferecer uma experiência simples o suficiente para uso semanal sem curva de aprendizado.

### 1.2 Público-Alvo

- Pessoa física, contribuinte do IRPF no Brasil.
- Usuário único por dispositivo (sem multi-tenant).
- Nível técnico: básico a intermediário.

---

## 2. Requisitos Funcionais

### RF-01 — Captura de documentos por câmera
**Prioridade:** Must Have  
**Descrição:** O app deve permitir que o usuário abra diretamente a câmera do dispositivo (mobile ou webcam no desktop) para fotografar recibos, notas fiscais e comprovantes sem sair da aplicação.  
**Critérios de aceite:**
- Botão "Fotografar" aciona a API MediaDevices do navegador.
- Preview da foto antes de salvar, com opção de refazer.
- Suporte a câmera traseira e frontal no mobile.
- Resolução mínima de 1 MP para garantir legibilidade.

---

### RF-02 — Upload de arquivos (PDF, imagem)
**Prioridade:** Must Have  
**Descrição:** O usuário deve poder importar documentos já existentes no dispositivo nos formatos PDF, JPG, PNG e HEIC.  
**Critérios de aceite:**
- Seletor de arquivo nativo do sistema operacional.
- Suporte aos formatos: `.pdf`, `.jpg`, `.jpeg`, `.png`, `.heic`, `.webp`.
- Tamanho máximo por arquivo: 20 MB.
- Preview de imagem e miniatura de PDF antes de confirmar o envio.

---

### RF-03 — Armazenamento 100% local
**Prioridade:** Must Have  
**Descrição:** Todos os documentos, metadados e configurações devem ser persistidos exclusivamente no dispositivo, sem qualquer comunicação com servidores externos.  
**Critérios de aceite:**
- Utilização de IndexedDB via biblioteca Dexie.js.
- Nenhuma requisição de rede para salvar, ler ou excluir documentos.
- App funciona completamente sem conexão com a internet.
- Dados persistem entre sessões e reinicializações do navegador.

---

### RF-04 — Categorização de documentos por tipo de dedução
**Prioridade:** Must Have  
**Descrição:** Cada documento deve ser classificado em uma das categorias fiscais reconhecidas pela Receita Federal para fins de dedução.  
**Critérios de aceite:**
- Categorias disponíveis: Saúde, Educação, Renda (holerites/informes), Previdência Privada (PGBL), Previdência Social (INSS), Doações, Aluguel, Pensão Alimentícia, Outros.
- Usuário seleciona a categoria no momento do cadastro.
- Possibilidade de alterar a categoria após o cadastro.
- Filtro de visualização por categoria na tela principal.

---

### RF-05 — Painel de totais por categoria
**Prioridade:** Must Have  
**Descrição:** Dashboard que exibe, em tempo real, o total acumulado de valores por categoria de dedução, comparado aos limites legais do IRPF.  
**Critérios de aceite:**
- Somatório automático de todos os documentos cadastrados por categoria.
- Exibição dos limites dedutíveis vigentes (ex.: educação R$ 3.561,50/pessoa).
- Indicador visual (barra de progresso) mostrando quanto do limite já foi atingido.
- Alerta visual quando o limite de uma categoria está próximo de ser atingido.

---

### RF-06 — Linha do tempo anual
**Prioridade:** Must Have  
**Descrição:** Visualização cronológica dos documentos distribuídos ao longo dos meses do ano fiscal, permitindo identificar lacunas na coleta.  
**Critérios de aceite:**
- Grade mensal (janeiro a dezembro) mostrando quantidade e valor total de documentos por mês.
- Destaque visual para meses sem nenhum documento cadastrado.
- Clique no mês abre lista de documentos daquele período.

---

### RF-07 — Busca e filtros avançados
**Prioridade:** Must Have  
**Descrição:** Mecanismo de busca textual e filtros combinados para localizar documentos rapidamente.  
**Critérios de aceite:**
- Busca por: nome do emitente, valor, data, observações.
- Filtros combinados: categoria + período (mês, trimestre, semestre, ano).
- Ordenação por: data (mais recente/mais antigo), valor (maior/menor).
- Resultados em tempo real enquanto o usuário digita.

---

### RF-08 — OCR automático para extração de dados
**Prioridade:** Should Have  
**Descrição:** Ao capturar ou importar uma imagem, o app deve tentar extrair automaticamente o valor monetário, a data e o nome do emitente usando reconhecimento óptico de caracteres executado localmente.  
**Critérios de aceite:**
- OCR processado inteiramente no dispositivo via Tesseract.js (sem API externa).
- Campos pré-preenchidos: valor (R$), data, emitente.
- Usuário pode revisar e corrigir antes de confirmar o cadastro.
- Indicador de progresso durante o processamento do OCR.
- Funciona para documentos em português.

---

### RF-09 — Checklist de documentos do IRPF
**Prioridade:** Should Have  
**Descrição:** Lista pré-configurada com os principais documentos que devem ser reunidos para a declaração do IRPF, com marcação de status de obtenção.  
**Critérios de aceite:**
- Checklist baseado nas categorias da Receita Federal.
- Usuário marca cada item como "Obtido", "Pendente" ou "Não se aplica".
- Percentual de completude exibido na tela principal.
- Itens personalizáveis: usuário pode adicionar ou remover itens.

---

### RF-10 — Alertas e lembretes
**Prioridade:** Should Have  
**Descrição:** Notificações dentro do app alertando sobre documentos importantes pendentes ou prazos relevantes.  
**Critérios de aceite:**
- Alerta ao abrir o app caso existam documentos pendentes no checklist.
- Lembrete nos meses de janeiro/fevereiro para buscar informes de rendimento dos empregadores.
- Alerta sobre o prazo de entrega da declaração (tipicamente março-maio).
- Notificações gerenciadas exclusivamente pela API de Notifications do navegador (sem push server).

---

### RF-11 — Backup local exportável
**Prioridade:** Must Have  
**Descrição:** O usuário deve poder exportar todos os dados do app em um arquivo compactado para backup manual e restaurá-los em caso de troca de dispositivo.  
**Critérios de aceite:**
- Exportação gera um arquivo `.zip` contendo: todos os documentos (imagens/PDFs) + arquivo JSON com metadados.
- Opção de proteção do arquivo de backup por senha.
- Importação do backup restaura todos os documentos e configurações.
- Aviso claro ao usuário sobre a importância de fazer backup regularmente.

---

### RF-12 — Autenticação por PIN ou biometria
**Prioridade:** Must Have  
**Descrição:** Tela de bloqueio que impede acesso não autorizado ao app e aos documentos fiscais.  
**Critérios de aceite:**
- PIN de 6 dígitos definido pelo usuário no primeiro acesso.
- Suporte a biometria (impressão digital, Face ID) via WebAuthn onde disponível.
- Bloqueio automático após 5 minutos de inatividade.
- Máximo de 5 tentativas erradas de PIN antes de exigir backup de acesso.

---

### RF-13 — Relatório PDF para contador
**Prioridade:** Should Have  
**Descrição:** Geração de um relatório em PDF com o resumo completo dos documentos organizados por categoria, para compartilhamento com um profissional contábil.  
**Critérios de aceite:**
- PDF gerado localmente via jsPDF + html2canvas.
- Conteúdo: resumo por categoria (total de itens + valor total), lista detalhada de cada documento (data, emitente, valor, categoria).
- Opção de incluir ou não as imagens dos documentos no PDF.
- Compartilhamento via API de Share do navegador (WhatsApp, e-mail, etc.).

---

### RF-14 — Criptografia local dos dados
**Prioridade:** Should Have  
**Descrição:** Os documentos armazenados no IndexedDB devem ser criptografados, de forma que sejam ilegíveis sem a autenticação correta.  
**Critérios de aceite:**
- Algoritmo AES-256-GCM via Web Crypto API nativa do navegador.
- Chave derivada do PIN do usuário via PBKDF2.
- Documentos descriptografados apenas em memória, durante a sessão ativa.
- Dados permanecem criptografados em repouso no IndexedDB.

---

### RF-15 — Modo escuro
**Prioridade:** Could Have  
**Descrição:** A interface deve respeitar a preferência de tema (claro/escuro) configurada no sistema operacional do usuário.  
**Critérios de aceite:**
- Detecção automática via `prefers-color-scheme` CSS.
- Opção manual de alternar o tema dentro do app.
- Persistência da preferência manual entre sessões.

---

### RF-16 — Exclusão segura de dados
**Prioridade:** Could Have  
**Descrição:** Funcionalidade para apagar completamente todos os dados do app do dispositivo.  
**Critérios de aceite:**
- Opção "Apagar tudo" nas configurações, com confirmação por PIN.
- Remoção de todos os registros do IndexedDB e cache do Service Worker.
- Aviso obrigatório recomendando backup antes de excluir.

---

### RF-17 — PWA instalável
**Prioridade:** Must Have  
**Descrição:** O app deve ser instalável como aplicativo nativo em dispositivos Android, iOS e desktop (Windows, macOS, Linux) via navegador.  
**Critérios de aceite:**
- Manifest JSON com ícones em múltiplas resoluções (192px, 512px).
- Prompt de instalação exibido automaticamente após uso recorrente.
- Ícone aparece na tela inicial / área de trabalho do dispositivo.
- Abre em modo standalone (sem barra de endereços do navegador).

---

### RF-18 — Funcionamento 100% offline
**Prioridade:** Must Have  
**Descrição:** Todas as funcionalidades do app devem estar disponíveis sem conexão com a internet, em qualquer momento.  
**Critérios de aceite:**
- Service Worker (via Workbox) armazena todos os assets do app no cache.
- Não há dependência de CDN externo em tempo de execução.
- Funcionalidades de câmera, OCR, armazenamento e geração de PDF funcionam offline.
- Indicador visual de status de conectividade (meramente informativo).

---

## 3. Requisitos Não Funcionais

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RNF-01 | Performance | Carregamento inicial em menos de 3 segundos em conexão 4G. OCR concluído em menos de 10 segundos por página A4. |
| RNF-02 | Compatibilidade | Suporte a Chrome 100+, Firefox 100+, Safari 15+ (iOS e macOS), Edge 100+. |
| RNF-03 | Privacidade | Zero telemetria, zero analytics, zero rastreamento. Nenhum dado do usuário sai do dispositivo. |
| RNF-04 | Armazenamento | Capacidade mínima gerenciada: 2 GB de documentos no IndexedDB. Aviso ao usuário quando storage > 80% da cota disponível. |
| RNF-05 | Acessibilidade | Conformidade mínima com WCAG 2.1 nível AA. Suporte a leitores de tela. |
| RNF-06 | Responsividade | Layout adaptado para telas de 320px a 2560px de largura. |
| RNF-07 | Segurança | Nenhuma dependência de biblioteca externa com vulnerabilidades conhecidas (CVE). Auditoria via `npm audit` a cada sprint. |
| RNF-08 | Manutenibilidade | Cobertura de testes unitários mínima de 70%. Código documentado em português. |

---

## 4. Restrições e Premissas

- O app **não terá backend próprio** em nenhum momento. Toda a lógica é client-side.
- O **OCR é opcional e best-effort**: se falhar, o usuário preenche os campos manualmente.
- A **criptografia local** é uma camada adicional de segurança; a segurança primária é o bloqueio do próprio dispositivo.
- Documentos do IRPF são referentes ao **ano-base 2026** (declaração prevista para 2027).
- O app será desenvolvido e mantido por um único desenvolvedor (ou pequena equipe), logo a complexidade arquitetural deve ser proporcional à capacidade de manutenção.

---

## 5. Critérios de Aceite Globais (Definition of Done)

Um requisito é considerado concluído quando:

1. A funcionalidade está implementada e testada em Chrome (desktop e mobile).
2. A funcionalidade funciona sem conexão com a internet.
3. Nenhum dado é enviado para fora do dispositivo durante a operação.
4. A interface está responsiva em telas de 375px (mobile) e 1280px (desktop).
5. O código passou pela revisão de lint e auditoria de segurança (`npm audit`).
6. Testes unitários cobrem os fluxos principais da funcionalidade.

---

*Documento gerado em abril de 2026. Revisão prevista para início da Sprint 1.*
