# API de Clientes - AWS Lambda

API serverless para gerenciamento de clientes construída com AWS Lambda, DynamoDB e TypeScript.

## Funcionalidades

- ✅ Criar clientes
- ✅ Listar todos os clientes
- ✅ Endpoint de health check
- ✅ Arquitetura serverless
- ✅ Integração com DynamoDB
- ✅ Suporte a TypeScript

## Pré-requisitos

- Node.js 18+
- AWS CLI configurado
- Serverless Framework

## Instalação

```bash
npm install
```

## Desenvolvimento

### Teste Local Lambda
```bash
npm run serverless:offline
```

## Deploy

### Deploy para AWS Lambda
```bash
npm run serverless:deploy
```

### Remover da AWS
```bash
npm run serverless:remove
```

### API Endpoints

- `GET /health` - Health check
- `GET /api/customers` - Listar todos os clientes
- `GET /api/customers?status` - Listar todos os clientes por status
- `GET /api/customers?name` - Listar todos os clientes por nome
- `POST /api/customers` - Criar novo cliente
- `DELETE /api/customers/{id}` - Deletar cliente
- `PUT /api/customers/{id}` - Atualizar um cliente
- `GET /api/customers/{id}` - Get de cliente especifico

## API Documentation

### Swagger UI
Iniciar swagger:
```bash
npm run docs
```

Entre em: http://localhost:8080/swagger-ui.html

## Configuração AWS

Configure suas credenciais AWS:

#### AWS CLI
```bash
aws configure
```
Digite suas credenciais quando solicitado:
- AWS Access Key ID
- AWS Secret Access Key
- Default region name
- Default output format

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `env.example`:

```env
AWS_REGION=us-east-1
DYNAMODB_TABLE=customer-api-dev
```

## Estrutura do Projeto

```
src/
├── config/          # Configuração AWS
│   └── dynamodb.ts
├── factories/       # Fábricas de dados
│   └── customer.factory.ts
├── handlers/        # Handlers Lambda
│   ├── customer.handler.ts
│   ├── health.handler.ts
│   └── index.ts
├── services/        # Lógica de negócio
│   └── customer.service.ts
├── types/           # Interfaces TypeScript
│   ├── customer.interface.ts
│   ├── http.interface.ts
│   ├── index.ts
│   └── lambda.interface.ts
├── utils/           # Funções utilitárias
│   ├── errors.utils.ts
│   ├── http.utils.ts
│   ├── index.ts
│   ├── lambda.utils.ts
│   └── validation.utils.ts
├── index.ts
├── routes.ts
└── server.ts
```

## Testes

```bash
npm run test
```
