.PHONY: start
start:
	uvicorn src.main.python.main:app --reload --port 9000

.PHONY: format
format:
	black .
	isort .