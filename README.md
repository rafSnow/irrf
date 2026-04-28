# Guardião Fiscal 🛡️

**Guardião Fiscal** é um Progressive Web App (PWA) offline-first projetado para ajudar contribuintes brasileiros a coletar, organizar e gerenciar documentos fiscais ao longo do ano, visando a declaração do IRPF 2027 (ano-base 2026).

## 🚀 Funcionalidades Principais

- **Captura Inteligente:** Utilize a câmera do celular para fotografar recibos ou faça upload de arquivos (PDF, JPG, PNG, HEIC).
- **OCR Local:** Extração automática de data, valor e emitente diretamente no dispositivo usando Tesseract.js.
- **Privacidade Absoluta:** Paradigma "Zero-Backend". Seus dados nunca saem do seu dispositivo.
- **Segurança Robusta:** Criptografia local AES-256-GCM protegida por PIN de 6 dígitos ou biometria (WebAuthn).
- **Dashboard Fiscal:** Acompanhe totais por categoria, limites dedutíveis e uma linha do tempo anual.
- **Checklist IRPF:** Lista pré-configurada dos documentos essenciais exigidos pela Receita Federal.
- **Relatórios PDF:** Gere relatórios detalhados para enviar ao seu contador.
- **Backup Local:** Exporte e importe seus dados via arquivos ZIP criptografados.

## 🛠️ Stack Tecnológica

- **Frontend:** React 19, TypeScript, Tailwind CSS 4.
- **Banco de Dados:** IndexedDB via Dexie.js.
- **Processamento:** Tesseract.js (OCR), jsPDF (Relatórios), JSZip (Backups).
- **PWA:** Vite PWA Plugin com Workbox para funcionamento 100% offline.

## 📦 Instalação e Uso

1.  Acesse a URL do projeto (GitHub Pages).
2.  No Chrome (Android/Desktop), clique em "Adicionar à tela inicial" ou no ícone de instalação na barra de endereços.
3.  Abra o app, siga o onboarding e crie seu PIN de segurança.
4.  Comece a cadastrar seus documentos!

## 🔒 Segurança e Privacidade

- **Sem Servidor:** Não existe banco de dados em nuvem. Se você trocar de dispositivo, deve usar a função de **Backup** para mover seus dados.
- **Criptografia:** Os arquivos são criptografados antes de serem salvos no banco de dados local. A chave de criptografia é gerada a partir do seu PIN e nunca é armazenada permanentemente.

## 📄 Licença

Este projeto é open-source sob a licença MIT.

---
*Desenvolvido para simplificar sua vida fiscal em 2027.*
