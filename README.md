# Compras e Estoque - Uniclean

Aplicativo para controle de compras, estoque, cotações, ordens de compra e recebimentos.

Este projeto usa:

- React + Vite no frontend
- Google Apps Script como backend/API
- Google Sheets como banco de dados principal
- GitHub/Codex para versionamento e desenvolvimento
- Lovable apenas como apoio visual quando necessário

## Objetivo

O sistema deve identificar itens que precisam de reposição de estoque, permitir emissão de cotações para fornecedores, registrar cotações criadas, controlar ordens de compra e futuramente controlar recebimentos.

## Arquitetura

```txt
Frontend React/Vite
        |
        | VITE_APPS_SCRIPT_URL
        v
Google Apps Script Web App
        |
        v
Google Sheets
```

## Planilhas usadas

### Compras

ID da planilha de compras:

```txt
1PdcjN8AszweiZPm5uJ02Rkg2XmVJYzdu-BI0ezNH0jw
```

Abas principais antigas:

- Fornecedores
- Itens
- Cotações
- Retorno dos Fornecedores
- Compras Realizadas
- Listas Suspensas

Abas novas do aplicativo:

- App_Config
- App_Usuarios
- App_Sessoes
- App_Cotacoes
- App_Cotacoes_Fornecedores
- App_Ordens_Compra
- App_Recebimentos
- App_Logs

### Estoque

ID da planilha de estoque:

```txt
16lHl5tpaU3cTdZ07lukmx7x-97y1yUJtznwtdTMoDtI
```

Fonte principal do dashboard:

- Relatório Estoque

## API Apps Script

A API do Apps Script já possui as ações:

- `getListasBasicas`
- `getDashboardCompras`
- `getFornecedores`
- `criarCotacao`
- `listarCotacoes`

Enquanto o projeto estiver em modo teste, nenhum e-mail real deve ser enviado para fornecedores.

## Configuração local

Crie um arquivo chamado `.env.local` na raiz do projeto.

Use este modelo:

```txt
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/SEU_DEPLOY_ID/exec
VITE_APPS_SCRIPT_TOKEN=seu-token-de-teste
```

Atenção:

- Nunca commitar `.env.local` no GitHub.
- Nunca colocar a URL real ou token real em arquivos versionados.
- O arquivo `.env.example` serve apenas como modelo.

## Instalação

```bash
npm install
```

## Rodar localmente

```bash
npm run dev
```

Depois abra o endereço mostrado pelo Vite no navegador.

## Gerar build

```bash
npm run build
```

## Regras importantes

- Google Sheets é o banco principal.
- Não usar Supabase como banco principal.
- Não usar banco/cloud do Lovable para dados operacionais.
- Não alterar abas antigas sem autorização.
- Não disparar e-mails reais sem confirmação explícita.
- Não armazenar senha em texto puro.
- Preferir alterações pequenas e revisáveis.

## Status atual

Concluído:

- Estrutura inicial React/Vite
- Cliente da API Apps Script
- Dashboard inicial de compras
- Listagem inicial de cotações
- Leitura de listas básicas
- Leitura de fornecedores
- Integração com Apps Script via variáveis de ambiente

Próximas etapas:

- Criar modal `Emitir cotação`
- Permitir seleção de fornecedores
- Gravar cotações reais pelo frontend
- Criar botão de envio de cotação em modo teste
- Integrar mecanismo existente de Google Forms/e-mail
- Criar fluxo de ordem de compra
- Criar dashboard de recebimento
