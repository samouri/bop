all: rbuild dbuild
rbuild:
	npm run build
dbuild:
	docker build --rm -t samouri/bopui .
