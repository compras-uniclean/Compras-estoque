# AGENTS.md

## Objetivo do projeto

Este projeto é um aplicativo de controle de compras, estoque, cotações, ordens de compra e recebimento para a Uniclean.

O aplicativo deve usar Google Sheets como banco de dados principal e Google Apps Script como backend/API.

## Arquitetura obrigatória

- Frontend: React/Vite.
- Backend/API: Google Apps Script publicado como Web App.
- Banco de dados principal: Google Sheets.
- Não usar Supabase como banco principal.
- Não usar banco/cloud do Lovable para dados operacionais.
- Não criar dependência de armazenamento pago.
- Lovable deve ser usado apenas para UI quando necessário.
- Codex/GitHub devem ser usados para implementação principal.

## Planilhas

### Planilha de compras

ID:

```txt
1PdcjN8AszweiZPm5uJ02Rkg2XmVJYzdu-BI0ezNH0jw
```

Abas antigas que já existem e não devem ser alteradas sem autorização:

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

### Planilha de estoque

ID:

```txt
16lHl5tpaU3cTdZ07lukmx7x-97y1yUJtznwtdTMoDtI
```

Fonte principal do dashboard:

- Relatório Estoque

Colunas usadas:

- Situação
- Qtd a comprar
- Tipo
- Código
- Descrição
- Estoque Atual
- Disponível
- Reservado
- Mín.
- Máx.
- ABC 3 meses
- ABC Ano passado

## API Apps Script

O frontend deve consumir a API do Apps Script usando variáveis de ambiente:

```txt
VITE_APPS_SCRIPT_URL
VITE_APPS_SCRIPT_TOKEN
```

A API já possui as ações:

- getListasBasicas
- getDashboardCompras
- getFornecedores
- criarCotacao
- listarCotacoes

## Segurança

- Enquanto `APP_MODO_TESTE = true`, nenhum e-mail real deve ser enviado.
- Não disparar e-mail para fornecedores sem confirmação explícita.
- Não gravar senha em texto puro.
- Não expor token no código versionado.
- Usar `.env.local` para variáveis locais.
- Usar secrets/variáveis do ambiente de deploy quando publicar.

## Regras de implementação

- Criar camada de API em `src/services/appsScriptClient.ts`.
- Criar tipos TypeScript para dashboard, fornecedores, cotações e listas.
- Não chamar diretamente Supabase para os novos dados de compras/estoque.
- Não remover código antigo sem autorização.
- Preferir PRs pequenos e revisáveis.
- Antes de finalizar, rodar build/lint se existirem scripts no projeto.
