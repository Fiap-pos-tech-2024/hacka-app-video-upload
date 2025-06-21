# Upload de Vídeos

## Resumo do projeto
Este projeto permite o upload de arquivos (somente vídeos) com tamanho máximo de 1GB. Os vídeos são armazenados em um bucket S3 da AWS, enquanto os metadados são salvos em um banco de dados MySQL. Além disso, uma mensagem é publicada em uma fila SQS para processamento posterior do vídeo.

Foi aplicada uma estratégia de cache para otimizar o desempenho das consultas.

O processamento posterior é feito de forma assíncrona, através de outro microsserviço que irá gerar imagens do vídeo e compilar um arquivo zip com as imagens geradas.

## Arquitetura do Projeto

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

## Qualidade

Para garantir a qualidade do código, foram implementadas as seguintes práticas:

**Linting**: Utilização do ESLint para manter o código limpo e consistente.

**Testes unitários:**

- Cobertura TOTAL (**100%**) das linhas, funções e branches do código, validada com Jest.
- Todos os fluxos, cenários e regras de negócio estão cobertos por testes automatizados.

**Testes de mutação:**

- Utilização do Stryker para garantir a robustez dos testes automatizados.
- Todos os mutantes gerados foram eliminados (killed), assegurando alta confiabilidade do código.

   > **O que são testes mutantes?**
   > Testes de mutação consistem em modificar propositalmente pequenos trechos do código (criando "mutantes") para verificar se os testes existentes conseguem detectar esses erros. Se todos os mutantes são "mortos" (ou seja, detectados pelos testes), isso indica que a suíte de testes é realmente eficaz na validação do comportamento do sistema. Utilizar testes mutantes aumenta a confiança na qualidade dos testes e na robustez do código.

### Execução dos testes

Testes unitários:
  ```sh
  npm test
  ```
Testes de mutação:
  ```sh
  npm run test:mutations
  ```

## Funcionalidades

- Upload de vídeos (até 1GB) via API utilizando o multer-s3 com armazenamento direto no bucket S3.
- Salvamento dos metadados do vídeo em um banco de dados MySQL
- Publicação de mensagem em uma fila SQS para processamento posterior do vídeo
- Operação atômica: upload para o S3, salvamento dos metadados e publicação da mensagem são feitos de forma atômica
- **Cache Redis** para otimizar a performance das consultas de leitura (listagem de vídeos por cliente e por id)

### Endpoints

- `POST /videos/upload` — Upload de vídeo (salva no S3, registra metadados e publica mensagem na fila)
- `GET /videos/:id` — Consulta os metadados de um vídeo por ID (usa cache)
- `GET /videos?customerId=...` — Lista todos os vídeos de um cliente e seus status (usa cache)
- `PATCH /videos/:id` — Atualiza status e zip gerado do vídeo (invalida cache)

## Como executar localmente

1. Suba o LocalStack e o MySQL:
   ```sh
   make up
   ```
2. Crie o bucket S3:
   ```sh
   make create-s3
   ```
3. Crie a fila SQS:
   ```sh
   make create-queue
   ```
4. Gere o arquivo `.env` com as variáveis de ambiente necessárias para a aplicação:
   ```sh
   make create-env-file
   ```
5. Instale as dependências:
   ```sh
   npm install
   ```
6. Gere os clientes do Prisma:
   ```sh
   npm run generate:prisma
   ```
7. Execute as migrations do banco de dados:
   ```sh
   npm run migrate
   ```
8. Inicie a aplicação em modo desenvolvimento:
   ```sh
   npm run start:dev
   ```

Para parar o LocalStack, Redis e o MySQL:
```sh
make down
```

## Documentação e Testes via Swagger

A aplicação possui documentação interativa e permite testar os endpoints diretamente pelo Swagger UI.

- Acesse: [http://localhost:3001/docs](http://localhost:3001/docs)
- Explore e execute as rotas da API diretamente pela interface web.

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
