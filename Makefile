# Makefile para LocalStack e criação de S3

LOCALSTACK_CONTAINER_NAME=localstack
BUCKET_NAME=poc-bucket

up:
	docker run --rm -d 											\
		-p 127.0.0.1:4566:4566 -p 127.0.0.1:4510-4559:4510-4559 \
		--name $(LOCALSTACK_CONTAINER_NAME) 					\
		-v /var/run/docker.sock:/var/run/docker.sock 			\
		-e DEBUG=${DEBUG-} 										\
		-e PERSISTENCE=0 										\
		localstack/localstack:latest

create-s3:
	aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket $(BUCKET_NAME)

create-env-file:
	echo "AWS_ACCESS_KEY_ID=localstack" > .env
	echo "AWS_SECRET_ACCESS_KEY=localstack" >> .env
	echo "AWS_REGION=us-east-1" >> .env
	echo "AWS_LOCAL_ENDPOINT=http://localhost:4566" >> .env
	echo "ENVIRONMENT=local" >> .env
	echo "AWS_BUCKET_NAME=$(BUCKET_NAME)" >> .env

down:
	docker stop $(LOCALSTACK_CONTAINER_NAME)
	docker stop $(POSTGRES_CONTAINER_NAME)