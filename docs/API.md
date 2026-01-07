# API Reference

## Base URL
```
http://localhost:3001
```

---

## Authentication

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

### POST /auth/login
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "username": "..." },
    "accessToken": "..."
  }
}
```

---

## Prompts API

### GET /api/prompts
List prompts with pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `sort` (hot, new, top)
- `tag` (tag slug)

### POST /api/prompts
Create a new prompt. *Requires authentication.*

### GET /api/prompts/:id
Get prompt details.

---

## Config API

### GET /api/config
Get app configuration (personalities, presets, tiers, templates, options).

---

## Upload API

### POST /api/upload
Upload an image. *Requires authentication.*

**Request:** `multipart/form-data` with `image` field

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cloudinary.com/...",
    "publicId": "..."
  }
}
```

---

## Admin API

All admin endpoints require admin role.

- `GET /api/admin/content/personalities`
- `POST /api/admin/content/personalities`
- `PUT /api/admin/content/personalities/:id`
- `DELETE /api/admin/content/personalities/:id`

Similar CRUD for: presets, tiers, techniques, templates
