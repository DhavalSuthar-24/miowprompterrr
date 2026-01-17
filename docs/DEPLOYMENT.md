# Deployment Guide

## Docker Deployment

### Prerequisites
- Docker & Docker Compose installed
- Environment variables configured

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd miownation_prompter
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Build and run**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec web npx prisma migrate deploy
   ```

---

## Environment Variables

### Required
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `OPENAI_API_KEY` | OpenAI API Key (Required for AI Agents) |

### Optional
| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | 3001 | Server port |
| `CORS_ORIGIN` | http://localhost:5173 | Allowed CORS origin |
| `FRONTEND_URL` | http://localhost:5173 | Frontend URL for redirects |
| `GOOGLE_CLIENT_ID` | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | - | Google OAuth secret |
| `Cloudname` | - | Cloudinary cloud name |
| `Cloudinary_API_key` | - | Cloudinary API key |
| `Cloudinary__API_secret` | - | Cloudinary API secret |

---

## Production Checklist

- [ ] Set strong JWT secrets (32+ characters)
- [ ] Configure production DATABASE_URL
- [ ] Set CORS_ORIGIN to production domain
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
