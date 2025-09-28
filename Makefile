.DEFAULT_GOAL := help

install: # install dependencies
	npm install

build: # build mac dmg
	npm run build:dmg

run: # run app locally
	npm start

help:
	@echo "Usage: make <target>"
	@echo "Targets:"
	@echo "  install - Install dependencies"
	@echo "  build - Build mac dmg"
	@echo "  run - Run app locally"
	@echo "  help - Show this help message"
