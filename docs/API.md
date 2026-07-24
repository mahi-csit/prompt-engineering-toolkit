# API Reference

Base URL: `http://localhost:8000`

Interactive docs: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

## Authentication

### POST /api/auth/signup
Register a new user.
```json
{ "username": "alice", "email": "alice@example.com", "password": "secret123" }
```
Returns `{ "access_token": "...", "token_type": "bearer", "user": {...} }`

### POST /api/auth/login
```json
{ "email": "alice@example.com", "password": "secret123" }
```

### GET /api/auth/me
Requires `Authorization: Bearer <token>`

---

## Prompts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/prompts/ | List prompts (search, filter, paginate) |
| POST   | /api/prompts/ | Create prompt |
| GET    | /api/prompts/{id} | Get single prompt |
| PUT    | /api/prompts/{id} | Update prompt |
| DELETE | /api/prompts/{id} | Delete prompt |
| GET    | /api/prompts/categories/list | All categories |
| POST   | /api/prompts/render | Render template with variables |
| GET    | /api/prompts/{id}/versions | Version history |
| POST   | /api/prompts/{id}/versions/{n}/rollback | Rollback to version |
| GET    | /api/prompts/{id}/export | Export as JSON |
| POST   | /api/prompts/import | Import from JSON |

---

## Playground

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/playground/compare | Compare across models |
| POST   | /api/playground/quick-test | Single model test |
| GET    | /api/playground/models | All available models |
| GET    | /api/playground/models/{provider} | Models by provider |
| GET    | /api/playground/providers | Provider status |

---

## Evaluations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/evaluations/evaluate | Score a prompt (AI) |
| POST   | /api/evaluations/optimize | Optimize a prompt (AI) |
| GET    | /api/evaluations/rubrics/default | List rubrics |

---

## Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/analytics/dashboard | Dashboard stats |
| GET    | /api/analytics/prompt-usage | Usage by prompt |
