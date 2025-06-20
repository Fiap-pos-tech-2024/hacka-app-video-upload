# Upload de Vídeos

Este projeto permite o upload de arquivos (somente vídeos) com tamanho máximo de 1GB.

## Funcionalidades
- Upload de vídeos utilizando o [multer](https://github.com/expressjs/multer)
- Armazenamento dos vídeos em um bucket S3
- Salvamento dos metadados do vídeo em um banco de dados Postgres
- Publicação de mensagem em uma fila (SQS) para processamento posterior do vídeo
- Operação atômica: o upload para o S3, o salvamento dos metadados no Postgres e a publicação na fila acontecem juntos, garantindo que todos sejam realizados ou nenhum deles

## Tecnologias Utilizadas
- Node.js
- Express
- Multer
- AWS S3
- AWS SQS
- PostgreSQL
- LocalStack (para desenvolvimento local)
- Docker (para LocalStack e Postgres)

## Como funciona
1. O usuário faz upload de um vídeo (até 1GB) via API
2. O vídeo é salvo temporariamente e validado
3. O vídeo é enviado para o bucket S3
4. Os metadados do vídeo são salvos no banco de dados Postgres
5. Uma mensagem é publicada na fila SQS com os dados do vídeo
6. Caso qualquer etapa falhe, nenhuma ação é persistida (garantia de atomicidade)

## Ambiente de Desenvolvimento
- Utilize o LocalStack para simular os serviços AWS localmente
- O banco de dados Postgres também é iniciado via Docker pelo Makefile
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
4. Gere o arquivo `.env` com as variáveis de ambiente (incluindo a URL do Postgres):
   ```sh
   make create-env-file
   ```
5. Instale as dependências:
   ```sh
   npm install
   ```
6. Inicie a aplicação em modo desenvolvimento:
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

## Observações
- Apenas arquivos de vídeo são aceitos
- O tamanho máximo permitido é de 1GB
- Os metadados dos vídeos são salvos no banco de dados Postgres de forma atômica junto com o upload para o S3 e a publicação na fila SQS.