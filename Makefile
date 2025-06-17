# Makefile para LocalStack e criação de S3

LOCALSTACK_CONTAINER_NAME=localstack
BUCKET_NAME=poc-bucket
POSTGRES_CONTAINER_NAME=techchallenge-postgres
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
POSTGRES_DB=poc


up:
	docker run --rm -d 											\
		-p 127.0.0.1:4566:4566 -p 127.0.0.1:4510-4559:4510-4559 \
		--name $(LOCALSTACK_CONTAINER_NAME) 					\
		-v /var/run/docker.sock:/var/run/docker.sock 			\
		-e DEBUG=${DEBUG-} 										\
		-e PERSISTENCE=0 										\
		localstack/localstack:latest

	docker run --rm -d 									\
		-p 5432:5432 									\
		--name $(POSTGRES_CONTAINER_NAME) 				\
		-e POSTGRES_USER=$(POSTGRES_USER) 			\
		-e POSTGRES_PASSWORD=$(POSTGRES_PASSWORD) 	\
		-e POSTGRES_DB=$(POSTGRES_DB) 				\
		postgres:latest

create-s3:
	aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket $(BUCKET_NAME)

create-queue:
	aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name uploaded-video-queue

create-env-file:
	echo "AWS_ACCESS_KEY_ID=localstack" > .env
	echo "AWS_SECRET_ACCESS_KEY=localstack" >> .env
	echo "POSTGRES_URL=postgresql://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost:5432/$(POSTGRES_DB)" >> .env
	echo "AWS_REGION=us-east-1" >> .env
	echo "AWS_LOCAL_ENDPOINT=http://localhost:4566" >> .env
	echo "ENVIRONMENT=local" >> .env
	echo "AWS_BUCKET_NAME=$(BUCKET_NAME)" >> .env
	UPLOADED_VIDEO_QUEUE_URL=$$(aws --endpoint-url=http://localhost:4566 sqs get-queue-url --queue-name uploaded-video-queue --output text --query 'QueueUrl'); \
	echo "UPLOADED_VIDEO_QUEUE_URL=$$UPLOADED_VIDEO_QUEUE_URL" >> .env

down:
	docker stop $(LOCALSTACK_CONTAINER_NAME)
	docker stop $(POSTGRES_CONTAINER_NAME)