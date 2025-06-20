# Upload de Vídeos

## Resumo do projeto
Este projeto permite o upload de arquivos (somente vídeos) com tamanho máximo de 1GB. Os vídeos são armazenados em um bucket S3 da AWS, enquanto os metadados são salvos em um banco de dados Postgres. Além disso, uma mensagem é publicada em uma fila SQS para processamento posterior do vídeo.

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
│       └── driven/      # Adaptadores de saída (ex: gateways para S3, SQS, Postgres)
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

### Como executar os testes

**Testes unitários:**
  ```sh
  npm test
  ```
**Testes de mutação:**
  ```sh
  npm run test:mutations
  ```

## Tecnologias Utilizadas
- Node.js
- Express
- Multer
- AWS S3
- AWS SQS
- PostgreSQL
- LocalStack (para desenvolvimento local)
- Docker (para LocalStack e Postgres)
- Jest (para testes automatizados)

## Funcionalidades

- Upload de vídeos (até 1GB) via API utilizando o [multer](https://github.com/expressjs/multer) e armazenamento direto no bucket S3 (multer-s3)
- Salvamento dos metadados do vídeo em um banco de dados Postgres
- Publicação de mensagem em uma fila SQS para processamento posterior do vídeo
- Operação atômica: o upload para o S3, o salvamento dos metadados no Postgres e a publicação da mensagem são feitos de forma atômica, garantindo que todos sejam realizados ou nenhum deles

Fluxo principal:
1. O usuário faz upload de um vídeo via API
2. O vídeo é enviado para o bucket S3
3. Os metadados do vídeo são salvos no banco de dados Postgres
4. Uma mensagem é publicada na fila SQS com os dados do vídeo

## Ambiente de Desenvolvimento
- Utilize o LocalStack para simular os serviços AWS localmente
- O banco de dados Postgres também é iniciado via Docker pelo Makefile para testes locais
- Veja o Makefile para comandos de setup rápido

## Como Executar

1. Suba o LocalStack e o Postgres:
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

Para parar o LocalStack e o Postgres:
```sh
make down
```

## Documentação e Testes via Swagger

A aplicação possui documentação interativa e permite testar os endpoints diretamente pelo Swagger UI.

- Acesse: [http://localhost:3001/docs](http://localhost:3001/docs)
- Explore e execute as rotas da API diretamente pela interface web.
