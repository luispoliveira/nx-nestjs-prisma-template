all:
	@echo Make what?!

deploy: pull install migrate generate build reload

devLocal: install compose migrate generate

compose:
	docker-compose up -d

pull:
	git pull

install:
	yarn

migrate:
	yarn prisma migrate deploy

generate:
	yarn prisma generate

build:
	yarn nx run-many --target=build

reload:
	pm2 restart ecosystem.config.js
