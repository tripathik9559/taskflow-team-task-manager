<div align="center">

# ⚡ TaskFlow

### A Full-Stack Team Task Manager

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

**[🚀 Live Demo](https://taskflow-team-task-manager-production.up.railway.app/)** · **[📁 Report Bug](https://github.com/your-username/taskmanager/issues)** · **[✨ Request Feature](https://github.com/your-username/taskmanager/issues)**

</div>

---

## 📸 Preview

| Login | Dashboard | Tasks |
|-------|-----------|-------|
| ![Login](screenshots/login.png) | ![Dashboard](screenshots/dashboard.png) | ![Tasks](screenshots/tasks.png) |

> *Add screenshots to a `/screenshots` folder in the repo to show them here*

---

## 🎯 About The Project

TaskFlow is a role-based team task management web app built as a college assignment project. The focus was on building a clean full-stack application from scratch — no frontend frameworks, no ORMs, just the fundamentals done properly.

**The core idea:** most task tools don't enforce role permissions at the API level — they just hide buttons in the UI. TaskFlow enforces every permission server-side, so a Member genuinely cannot create or delete tasks regardless of how they call the API.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login/signup, tokens expire after 7 days
- 👥 **Role-Based Access Control** — Admin vs Member, enforced on every API route
- 📁 **Project Management** — Create projects, add/remove team members per project
- ✅ **Task Tracking** — Full CRUD with priority, deadline, assignee, and status flow
- 📊 **Live Dashboard** — Stats: total, completed, pending, active projects, overdue
- 💬 **Task Comments** — Team members can discuss tasks inline
- 📋 **Activity Log** — Every action recorded with user and timestamp
- 🔴 **Overdue Detection** — Automatic flagging based on deadline date
- 🔍 **Search & Filter** — Filter by status, priority, project, or keyword
- 📱 **Responsive Design** — Works on mobile with collapsible sidebar

---

## 🚀 Try It Live

> No signup needed — use the demo accounts below

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | `demo_admin@example.com` | `TaskFlow@2025` |
| 👤 Member | `demo_user@example.com` | `TaskFlow@2025` |

**Admin** can create projects, assign tasks, manage team members, and view the full activity log.  
**Member** can view assigned tasks, update their status, and add comments.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | HTML5, CSS3, Vanilla JS | No build step, easy to read |
| Backend | Node.js + Express.js | Lightweight, fast to build |
| Database | MySQL | Relational data with proper FK constraints |
| Auth | JWT + bcryptjs | Stateless auth, hashed passwords |
| Deployment | Railway | Free tier, easy MySQL plugin |

No React. No ORM. Raw SQL and `fetch()` — which makes the code transparent and close to fundamentals.

---

## 📂 Project Structure

```
taskmanager/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MySQL pool + auto table init + demo seed
│   │   └── schema.sql             # Full schema — run once for fresh setup
│   ├── controllers/
│   │   ├── authController.js      # Signup, login, profile
│   │   ├── projectController.js   # Project CRUD + member management
│   │   ├── taskController.js      # Task CRUD + comments
│   │   └── dashboardController.js # Stats, activity log, user list
│   ├── middleware/
│   │   └── auth.js                # JWT verify + admin-only guard
│   ├── routes/                    # auth / projects / tasks / dashboard
│   ├── utils/
│   │   └── logger.js              # Activity log helper
│   ├── .env.example
│   └── server.js                  # Entry point + static file serving
├── frontend/
│   ├── css/style.css              # All styles, no framework
│   ├── js/
│   │   ├── api.js                 # All fetch() wrappers
│   │   ├── utils.js               # Toast, dates, auth helpers
│   │   └── sidebar.js             # Sidebar + mobile toggle
│   ├── pages/
│   │   ├── dashboard.html
│   │   ├── projects.html
│   │   ├── tasks.html
│   │   ├── team.html              # Admin only
│   │   ├── activity.html          # Admin only
│   │   └── profile.html
│   └── index.html                 # Login / Signup
├── Procfile                       # Railway deployment
└── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://dev.mysql.com/downloads/) 8.0+

### 1. Clone the repo

```bash
git clone https://github.com/your-username/taskmanager.git
cd taskmanager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

```bash
mysql -u root -p
```

```sql
source /full/path/to/taskmanager/backend/config/schema.sql
exit
```

### 4. Configure environment

```bash
cp backend/.env.example backend/.env   # Mac/Linux
copy backend\.env.example backend\.env  # Windows
```

Edit `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=taskmanager_db
JWT_SECRET=any_long_random_string
```

### 5. Run

```bash
npm start
```

Visit **http://localhost:5000** — demo accounts are auto-seeded on first run.

---

## 🌐 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Server port |
| `DB_HOST` | Yes | — | MySQL host |
| `DB_USER` | Yes | — | MySQL username |
| `DB_PASSWORD` | Yes | — | MySQL password |
| `DB_NAME` | Yes | — | Database name |
| `JWT_SECRET` | Yes | — | JWT signing secret |
| `DATABASE_URL` | No | — | Full connection string (Railway auto-sets this) |

---

## 📡 API Reference

<details>
<summary><b>Auth Routes</b></summary>

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Register new account | Public |
| POST | `/api/auth/login` | Login, get JWT | Public |
| GET | `/api/auth/me` | Get current user | Auth |
| PUT | `/api/auth/profile` | Update profile | Auth |

</details>

<details>
<summary><b>Project Routes</b></summary>

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/projects` | List projects | Auth |
| POST | `/api/projects` | Create project | Admin |
| PUT | `/api/projects/:id` | Edit project | Admin |
| DELETE | `/api/projects/:id` | Delete project | Admin |
| GET | `/api/projects/:id/members` | List members | Auth |
| POST | `/api/projects/:id/members` | Add member | Admin |
| DELETE | `/api/projects/:id/members/:uid` | Remove member | Admin |

</details>

<details>
<summary><b>Task Routes</b></summary>

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tasks` | List tasks (filterable) | Auth |
| POST | `/api/tasks` | Create task | Admin |
| PUT | `/api/tasks/:id` | Update task | Admin (full) / Member (status only) |
| DELETE | `/api/tasks/:id` | Delete task | Admin |
| GET | `/api/tasks/:id/comments` | Get comments | Auth |
| POST | `/api/tasks/:id/comments` | Add comment | Auth |

</details>

<details>
<summary><b>Dashboard Routes</b></summary>

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard` | Stats + overdue tasks | Auth |
| GET | `/api/dashboard/users` | All users | Admin |
| GET | `/api/dashboard/activity` | Activity log | Auth |

</details>

---

## 🗄️ Database Schema

```
users              projects           tasks
──────────         ──────────         ──────────
id (PK)            id (PK)            id (PK)
name               name               title
email (UNIQUE)     description        description
password (bcrypt)  created_by (FK)    status (enum)
role (enum)        created_at         priority (enum)
created_at                            deadline
                                      assigned_to (FK)
project_members    task_comments      project_id (FK)
──────────         ──────────         created_by (FK)
project_id (FK)    id (PK)
user_id (FK)       task_id (FK)       activity_log
                   user_id (FK)       ──────────
                   comment            id (PK)
                   created_at         user_id (FK)
                                      action
                                      entity_type
                                      entity_id
                                      created_at
```

---

## 🚢 Deploy on Railway

1. Push repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Add a **MySQL** plugin from the Railway dashboard
4. Copy DB credentials from the MySQL plugin's **Connect** tab into Railway's **Variables** panel
5. Add `JWT_SECRET` variable
6. In the Railway MySQL console, run `backend/config/schema.sql`
7. Deploy — Railway reads the `Procfile` automatically

---

## 🔮 Future Improvements

- [ ] Email notifications for task assignments and overdue alerts
- [ ] File attachments on tasks
- [ ] Admin ability to change user roles post-signup
- [ ] Pagination for large task lists
- [ ] Unit tests for API controllers
- [ ] Dark mode toggle

---

## 👨‍💻 Author

**Kartikey Kumar Tripathi**  
Babu Banarasi Das Northern India Institute of Technology

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/your-username)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/your-profile)

---

<div align="center">

*Built with Node.js + Express + MySQL + Vanilla JS*  
⭐ Star this repo if you found it helpful!

</div>
