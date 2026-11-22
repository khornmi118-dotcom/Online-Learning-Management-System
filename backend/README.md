# EduPlatform API

The API runs on port `5000` and stores users, courses, and enrollments in the configured MongoDB database. Set `JWT_SECRET` to a generated secret of at least 32 characters; the API refuses to start without one. Public registration always creates a student account.

## Routes

| Method | Route | Access |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Authenticated |
| `PATCH` | `/api/auth/me` | Authenticated; update own name and email |
| `GET` | `/api/courses` | Public, published courses |
| `GET` | `/api/courses/manage` | Admin, all courses including drafts |
| `GET` | `/api/courses/:id` | Public, published course |
| `POST` | `/api/courses` | Admin |
| `PUT` | `/api/courses/:id` | Admin |
| `DELETE` | `/api/courses/:id` | Admin; returns `409` if the course has enrollments |
| `POST` | `/api/enrollments/:courseId` | Student or admin |
| `GET` | `/api/enrollments/my-courses` | Student or admin |
| `GET` | `/api/student/dashboard` | Student or admin |
| `GET` | `/api/admin/dashboard` | Admin |
| `GET` | `/api/admin/students` | Admin, read-only student list |
| `GET` | `/api/admin/enrollments` | Admin, read-only enrollment list |
| `GET` | `/api/health` | Public |

Successful responses use `{ "success": true, "data": ... }`. Errors include `{ "success": false, "message": ... }`. Passwords are bcrypt-hashed and never included in responses; authenticated routes accept `Authorization: Bearer <token>`. Access tokens expire after one day.

## Create the first admin

Register a normal account, then promote that account using the MongoDB shell from the project root:

```powershell
docker compose exec mongodb mongosh edu_platform --eval 'db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })'
```

Replace the email with the registered account’s normalized email. Never accept a role from public registration.

## Local checks

From `backend/`, run `npm test` for validation tests or `npm start` to start the API. In Docker, use `docker compose up --build`; the Compose configuration sets `NODE_ENV=production` for the backend.
