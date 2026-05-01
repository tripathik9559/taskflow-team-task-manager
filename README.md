# TaskFlow — Team Task Manager

## LIVE DEMO **https://taskflow-manager-production-03eb.up.railway.app/**

**Kartikey Kumar Tripathi**  
Babu Banarasi Das Northern India Institute of Technology  

---

I built this as a full-stack assignment project. The idea was simple — most task management tools are either too complex or don't actually enforce who can do what. So I made one from scratch where the role separation (Admin vs Member) is strict and baked into both the frontend and backend.

The whole thing runs on Node.js + Express on the backend, MySQL for storage, and plain HTML/CSS/JS on the frontend — no React, no fancy frameworks. Just the basics, done properly.

---

## What it does

When you log in as an **Admin**, you can create projects, add team members to those projects, create tasks and assign them to members, set deadlines and priority levels, and track everything from a central dashboard. You can also see the full activity log — who did what and when.

When you log in as a **Member**, you only see the tasks assigned to you. You can't create tasks or projects. What you *can* do is update the status of your own tasks (Todo → In Progress → Done) and leave comments. That's it — nothing more, nothing less.

The dashboard shows live stats: total tasks, how many are pending/in-progress/done, and which ones are overdue. Overdue tasks turn red automatically based on the deadline date.

---

## Features

- Signup and login with JWT authentication — tokens expire after 7 days
- Admin and Member roles — enforced on every API route, not just the UI
- Create, edit, delete projects
- Add and remove members from specific projects
- Create tasks with title, description, assignee, deadline, and priority (Low / Medium / High)
- Task status tracking — Todo → In Progress → Done
- Task comments — members can leave notes on any task
- Activity log — every action is recorded with the user's name and timestamp
- Dashboard with project progress bars and overdue task list
- Search and filter tasks by status, priority, project, or keyword — all client-side JS, no extra libraries
- Profile page to update your name and email
- Responsive layout — works on mobile too, pure CSS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Deployment | Railway |

No frontend framework. No ORM. Just raw SQL queries and fetch() calls — which makes the code easier to read and debug.

---

## Project Structure

```
taskmanager/
├── backend/
│   ├── config/
│   │   ├── db.js              # MySQL connection pool setup
│   │   └── schema.sql         # All table definitions — run this first
│   ├── controllers/
│   │   ├── authController.js      # Signup, login, profile
│   │   ├── projectController.js   # Project CRUD + member management
│   │   ├── taskController.js      # Task CRUD + comments
│   │   └── dashboardController.js # Stats, activity log, user list
│   ├── middleware/
│   │   └── auth.js            # JWT verification + admin-only guard
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── dashboard.js
│   ├── utils/
│   │   └── logger.js          # Helper to write to activity_log table
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Entry point, also serves frontend static files
├── frontend/
│   ├── css/
│   │   └── style.css          # Everything styled from scratch
│   ├── js/
│   │   ├── api.js             # All fetch() wrappers in one place
│   │   ├── utils.js           # Toast notifications, date formatting, auth helpers
│   │   └── sidebar.js         # Sidebar rendering + mobile hamburger toggle
│   ├── pages/
│   │   ├── dashboard.html
│   │   ├── projects.html
│   │   ├── tasks.html
│   │   ├── team.html          # Admin only
│   │   ├── activity.html      # Admin only
│   │   └── profile.html
│   └── index.html             # Login / Signup
├── .gitignore
├── package.json
├── Procfile                   # For Railway
└── README.md
```

---

## Running it locally

You need Node.js (v18 or higher) and MySQL installed.

**1. Clone the repo**
```bash
git clone <your-repo-url>
cd taskmanager
```

**2. Create the database tables**

Open MySQL:
```bash
mysql -u root -p
```
Then inside MySQL prompt:
```sql
source /full/path/to/taskmanager/backend/config/schema.sql
```

This creates the `taskmanager_db` database and all 6 tables.

**3. Set up your .env file**

```bash
cd backend
copy .env.example .env        # Windows
# cp .env.example .env        # Mac/Linux
```

Open `backend/.env` and fill in your details:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=taskmanager_db
JWT_SECRET=any_long_random_string_here
```

**4. Install dependencies**
```bash
cd ..
npm install
```

**5. Start the server**
```bash
cd backend
npm start
```

You should see:
```
Server running on port 5000
MySQL connected successfully
```

Open `http://localhost:5000` in your browser. Sign up with Admin role first.

---

## Deploying on Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Add a MySQL plugin from the Railway dashboard
4. Set these environment variables in Railway:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — copy from Railway's MySQL plugin panel
   - `JWT_SECRET` — any long random string
5. In the Railway MySQL console, run the contents of `backend/config/schema.sql`
6. Deploy — Railway picks up the `Procfile` automatically and starts the server

---

## API Reference

| Method | Endpoint | What it does | Access |
|--------|----------|--------------|--------|
| POST | /api/auth/signup | Register a new account | Public |
| POST | /api/auth/login | Login, get JWT token | Public |
| GET | /api/auth/me | Get your own profile | Auth |
| PUT | /api/auth/profile | Update name or email | Auth |
| GET | /api/projects | List accessible projects | Auth |
| POST | /api/projects | Create a project | Admin |
| PUT | /api/projects/:id | Edit a project | Admin |
| DELETE | /api/projects/:id | Delete a project | Admin |
| GET | /api/projects/:id/members | List project members | Auth |
| POST | /api/projects/:id/members | Add a member | Admin |
| DELETE | /api/projects/:id/members/:uid | Remove a member | Admin |
| GET | /api/tasks | List tasks (supports filters) | Auth |
| POST | /api/tasks | Create a task | Admin |
| PUT | /api/tasks/:id | Update task | Admin full / Member status-only |
| DELETE | /api/tasks/:id | Delete a task | Admin |
| GET | /api/tasks/:id/comments | Get comments | Auth |
| POST | /api/tasks/:id/comments | Add a comment | Auth |
| GET | /api/dashboard | Dashboard stats | Auth |
| GET | /api/dashboard/users | List all users | Admin |
| GET | /api/dashboard/activity | Full activity log | Admin |

Members can only update the `status` field on tasks assigned to them. Any attempt to change title, priority, or deadline returns a 403.

---

## Database Schema

Six tables:

- `users` — name, email, hashed password, role
- `projects` — name, description, created_by
- `project_members` — junction table linking users to projects
- `tasks` — title, description, status, priority, deadline, assigned_to, project_id
- `task_comments` — each comment linked to a task and a user
- `activity_log` — action string, entity type, entity id, user id, timestamp

Passwords are hashed with bcrypt (10 salt rounds) before storage. JWTs carry the user's id, name, email, and role, and are valid for 7 days.

---

## Things I'd add with more time

- Email notifications when a task is assigned or goes overdue
- File attachments on tasks
- Admin ability to change a user's role after signup
- Pagination on large task lists
- Unit tests for the API controllers

---

*Node.js + Express + MySQL + Vanilla JS. Built and debugged manually.*
