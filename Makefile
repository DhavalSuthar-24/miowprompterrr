# MiowNation Prompter - Development Commands
# Run `make help` to see all available commands

.PHONY: help dev server frontend build test clean db-migrate db-seed db-studio docker install

# Default target
help:
	@echo "MiowNation Prompter - Available Commands"
	@echo "========================================"
	@echo ""
	@echo "Development:"
	@echo "  make dev         - Run frontend + backend together"
	@echo "  make frontend    - Run frontend only (Vite)"
	@echo "  make server      - Run backend only (Express)"
	@echo ""
	@echo "Build & Test:"
	@echo "  make build       - Build for production"
	@echo "  make test        - Run tests"
	@echo "  make typecheck   - TypeScript type check"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate  - Run Prisma migrations"
	@echo "  make db-seed     - Seed the database"
	@echo "  make db-studio   - Open Prisma Studio"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up   - Start with Docker Compose"
	@echo "  make docker-down - Stop Docker containers"
	@echo "  make docker-build - Build Docker image"
	@echo ""
	@echo "Misc:"
	@echo "  make install     - Install dependencies"
	@echo "  make clean       - Clean build artifacts"

# ===================
# Development
# ===================

# Run both frontend and backend
dev:
	npm run dev:all

# Run frontend only
frontend:
	npm run dev

# Run backend only  
server:
	npm run dev:server

# ===================
# Build & Test
# ===================

build:
	npm run build

test:
	npm test

typecheck:
	npm run typecheck

# ===================
# Database
# ===================

db-migrate:
	npx prisma migrate dev

db-seed:
	npm run db:seed

db-studio:
	npm run db:studio

db-reset:
	npx prisma migrate reset --force

# ===================
# Docker
# ===================

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker build -t miownation-prompter:latest .

docker-logs:
	docker-compose logs -f

# ===================
# Misc
# ===================

install:
	npm install

clean:
	rm -rf dist node_modules/.cache

# Full setup for new developers
setup: install db-migrate db-seed
	@echo "✅ Setup complete! Run 'make dev' to start."
