# Makefile para LocalStack e criação de S3

LOCALSTACK_CONTAINER_NAME=localstack
BUCKET_NAME=poc-bucket
MYSQL_CONTAINER_NAME=techchallenge-mysql
MYSQL_USER=user
MYSQL_PASSWORD=pass
MYSQL_DB=poc


up:
	docker run --rm -d 											\
		-p 127.0.0.1:4566:4566 -p 127.0.0.1:4510-4559:4510-4559 \
		--name $(LOCALSTACK_CONTAINER_NAME) 					\
		-v /var/run/docker.sock:/var/run/docker.sock 			\
		-e DEBUG=${DEBUG-} 										\
		-e PERSISTENCE=0 										\
		localstack/localstack:latest

	docker run --rm -d 									\
		-p 3306:3306 									\
		--name $(MYSQL_CONTAINER_NAME) 				\
		-e MYSQL_ROOT_PASSWORD=$(MYSQL_PASSWORD) 	\
		-e MYSQL_DATABASE=$(MYSQL_DB) 				\
		-e MYSQL_USER=$(MYSQL_USER) 					\
		-e MYSQL_PASSWORD=$(MYSQL_PASSWORD) 			\
		mysql:latest

create-s3:
	aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket $(BUCKET_NAME)

create-queue:
	aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name uploaded-video-queue

create-env-file:
	echo "AWS_ACCESS_KEY_ID=localstack" > .env
	echo "AWS_SECRET_ACCESS_KEY=localstack" >> .env
	echo "MYSQL_URL=mysql://root:$(MYSQL_PASSWORD)@localhost:3306/$(MYSQL_DB)" >> .env
	echo "AWS_REGION=us-east-1" >> .env
	echo "AWS_LOCAL_ENDPOINT=http://localhost:4566" >> .env
	echo "ENVIRONMENT=local" >> .env
	echo "AWS_BUCKET_NAME=$(BUCKET_NAME)" >> .env
	UPLOADED_VIDEO_QUEUE_URL=$$(aws --endpoint-url=http://localhost:4566 sqs get-queue-url --queue-name uploaded-video-queue --output text --query 'QueueUrl'); \
	echo "UPLOADED_VIDEO_QUEUE_URL=$$UPLOADED_VIDEO_QUEUE_URL" >> .env

down:
	docker stop $(LOCALSTACK_CONTAINER_NAME)
	docker stop $(MYSQL_CONTAINER_NAME)