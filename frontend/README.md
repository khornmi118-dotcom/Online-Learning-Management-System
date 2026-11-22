# EduPlatform frontend

Vue 3, Vite, Vue Router, and Tailwind CSS frontend for EduPlatform.

## Run locally

From `frontend/`, run `npm ci` and then `npm run dev`. The Vite development server proxies `/api` requests to `http://localhost:5000`; override this with `VITE_API_PROXY_TARGET` if your backend listens elsewhere. Optionally set `VITE_API_BASE_URL` to a different browser-accessible API base URL (including its `/api` prefix).

## Pages

- `/` — EduPlatform home and API health indicator
- `/login` and `/register` — account forms
- `/courses` and `/courses/:id` — course catalog and details
- `/student` — student learning dashboard
- `/admin` — administrator overview
- `/profile` — authenticated user's profile

Authenticated navigation and route access use the current user returned by `GET /api/auth/me`; registration creates student accounts only. The frontend uses `PATCH /api/auth/me` for profile updates, student dashboard/enrollment routes for either role, and admin-only `GET /api/admin/dashboard`, `GET /api/admin/students`, `GET /api/admin/enrollments`, and course-management routes. The admin dashboard manages courses and displays read-only student/enrollment lists. The backend persists courses in MongoDB; published courses appear on `/courses`, while drafts remain visible to admins only. The Docker Nginx configuration proxies `/api/` to the backend and falls back to `index.html` for Vue Router routes.

## Docker

From the project root, run `docker compose up --build`. Open [http://localhost](http://localhost). The existing compose configuration starts MongoDB, the backend, and the frontend; the frontend build uses the existing multistage Dockerfile.
