# Upload de Vídeos
Microsserviço responsável por permitir o upload de vídeos para posterior processamento, consulta e atualização de status.

## ✨ Resumo
Este projeto é uma API RESTful que oferece as seguintes funcionalidades:

- **Upload de Vídeos**: Permite o upload de vídeos com tamanho máximo de 1GB.
  - São armazenados em um bucket S3 da AWS.
  - Os metadados dos vídeos são salvos em um banco de dados MySQL.
  - Publica uma mensagem em uma fila SQS para processamento posterior do vídeo.
- **Consulta de Vídeos**: Permite consultar os metadados de um vídeo gravado anteriormente.
  - Consultar por ID do vídeo ou pelo cliente.
  - Utiliza cache Redis para otimizar as consultas.
- **Atualização de Vídeos**: Permite atualizar o status e o zip gerado do vídeo (pós processamento).

**Operação Atômica**: O upload para o S3, o salvamento dos metadados e a publicação da mensagem na fila SQS são feitos de forma atômica, garantindo consistência.

## 📁 Arquitetura

Este projeto segue a arquitetura hexagonal (Ports and Adapters), promovendo separação de responsabilidades e facilidade de manutenção. Abaixo está a estrutura principal de pastas e suas responsabilidades:

```
├── src/
│   ├── core/
│   │   ├── application/ # Casos de uso e lógica de negócio (core da aplicação)
│   │   └── domain/      # Entidades e regras de domínio
│   │ 
│   └── adapters/
│       ├── driver/      # Adaptadores de entrada (ex: controllers, rotas HTTP)
│       └── driven/      # Adaptadores de saída (ex: gateways para S3, SQS, MySQL)
```

## ✅ Qualidade

Para garantir a qualidade do código, foram implementadas as seguintes práticas:

**Linting**: Utilização do ESLint para manter o código limpo e consistente.

**Testes unitários:** Cobertura TOTAL (**100%**) das linhas, funções e branches do código, validada com Jest.

**Testes de mutação:** Todos os mutantes gerados foram eliminados (killed), assegurando alta confiabilidade do código.

> **O que são testes mutantes?**
> Testes de mutação consistem em modificar propositalmente pequenos trechos do código (criando "mutantes") para verificar se os testes existentes conseguem detectar esses erros. Se todos os mutantes são "mortos" (ou seja, detectados pelos testes), isso indica que a suíte de testes é realmente eficaz na validação do comportamento do sistema. Utilizar testes mutantes aumenta a confiança na qualidade dos testes e na robustez do código.

### 🧪 Testes
```bash
# Testes unitários
npm test

# Testes de mutação
npm run test:mutations
```

## 📌 Endpoints

`POST /videos/upload` — Upload de vídeo (salva no S3, registra metadados e publica mensagem na fila)

`GET /videos/:id` — Consulta os metadados de um vídeo por ID (usa cache)

`GET /videos?customerId=...` — Lista todos os vídeos de um cliente e seus status (usa cache)

`PATCH /videos/:id` — Atualiza status e zip gerado do vídeo (invalida cache)

## 🛠️ Comandos

### 🚀 Execução local

```bash
# 1. Clone o repositório
git clone https://github.com/Fiap-pos-tech-2024/hacka-app-video-upload.git
cd hacka-app-video-upload

# 2. Suba o LocalStack, Redis e MySQL utilizando Docker
make up

# 3. Crie o bucket S3
make create-s3

# 4. Crie a fila SQS
make create-queue

# 5. Gere o arquivo .env com as variáveis de ambiente necessárias
make create-env-file

# 6. Instale as dependências
npm install

# 7. Gere os clientes do Prisma
npm run generate:prisma

# 8. Execute as migrations do banco de dados
npm run migrate

# 9. Inicie a aplicação
npm run start:dev
```

### 🌐 Acessando a API

A aplicação possui documentação interativa e permite testar os endpoints diretamente pelo Swagger UI. [http://localhost:3001/docs](http://localhost:3001/docs)


### 🛑 Parando os serviços
```bash
# Irá parar todos os containers do Docker
make down
```

## Tecnologias Utilizadas

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white&style=flat-square)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white&style=flat-square)
![AWS S3](https://img.shields.io/badge/AWS%20S3-569A31?logo=amazon-aws&logoColor=white&style=flat-square)
![AWS SQS](https://img.shields.io/badge/AWS%20SQS-232F3E?logo=amazon-aws&logoColor=white&style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-336791?logo=mysql&logoColor=white&style=flat-square)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white&style=flat-square)
![LocalStack](https://img.shields.io/badge/LocalStack-00BFFF?logo=amazon-aws&logoColor=white&style=flat-square)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=flat-square)
![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white&style=flat-square)
