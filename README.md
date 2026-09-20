# Leet Sheet

A clean, public **LeetCode progress tracker** for organizing DSA practice into sections, topics, and problem lists.

🔗 **Repository:** https://github.com/Subrat-1911/leet-sheet

## ✨ Features

- 👤 **Username-only access** — enter your LeetCode username to open your progress dashboard.
- 🗂️ **Hierarchical DSA structure** — organize content as `Section → Topic → Subtopic → Problems`.
- ♾️ **Unlimited nesting** — sections can contain other sections at any depth.
- 🔗 **Direct LeetCode links** — click a problem to open it on LeetCode.
- ✅ **Automatic solved detection** — accepted LeetCode submissions can update the problem status.
- 🟢 **Persistent solved state** — once a problem is marked solved, it remains solved in the database.
- 📊 **Recursive progress tracking** — progress is calculated from problems upward through topics and parent sections.
- 🔁 **Same problem in multiple sections** — a LeetCode problem can be organized into different lists.
- 🛠️ **Admin dashboard** — create, edit, and delete sections and problems.
- 🎨 **Old-money UI** — minimal black, ivory, and antique-gold visual design.

## 🧱 Structure

The platform is built around a flexible tree:

```text
DATA STRUCTURES
├── Arrays
│   ├── Hashing
│   │   ├── Two Sum
│   │   └── Valid Anagram
│   └── Two Pointers
│       └── ...
└── Linked List
    └── ...

ALGORITHMS
├── Sorting
├── Searching
└── Dynamic Programming
```

The actual structure is controlled from the admin dashboard, so new sections and topics can be added without changing the code.

## 🛠️ Tech Stack

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Prisma 8**
- **PostgreSQL**
- **Supabase**
- **LeetCode API**
- **Vercel**

## 🔐 Authentication

The public tracker uses a LeetCode username to identify the user.

The admin area is protected separately using username/password authentication, HTTP-only session cookies, JWT-based sessions, and hashed admin passwords.

No passwords or database credentials are stored in the repository.

## 🗄️ Database

The main database entities are:

```text
Section
   ├── child Sections
   └── Problems

User
   └── UserProgress
          └── Problem

AdminUser
```

The `Section` model uses a self-referencing relationship, allowing unlimited nested sections.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Subrat-1911/leet-sheet.git
cd leet-sheet
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
DATABASE_URL="your-postgresql-connection-string"
AUTH_SECRET="your-secret-key"
```

Do **not** commit your `.env` file.

### 4. Apply database migrations

```bash
npx prisma db migrate
```

### 5. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## 👨‍💻 Admin

The admin dashboard is used to manage the DSA content.

You can:

- Create top-level sections
- Create nested sections
- Add LeetCode problems
- Edit sections
- Edit problems
- Delete problems
- Delete sections when they contain no children or problems

Admin credentials should be created locally and kept outside the repository.

## 📈 Progress Tracking

Progress is calculated recursively. For example:

```text
10 Problems
├── 7 Solved
└── 3 Unsolved

Progress = 70%
```

A parent's progress includes the problems contained in its descendant sections.

## 🔄 LeetCode Sync

When a user opens a problem, Leet Sheet can check the user's accepted LeetCode submissions.

If the target problem has been accepted:

```text
Unsolved → Solved
```

The solved state is persisted in the database and is not reverted by later checks.

## 🌐 Repository

**https://github.com/Subrat-1911/leet-sheet**

## 📌 Project Status

🚧 **Active development**

The core tracker, admin management, recursive sections, database persistence, progress calculation, and LeetCode solved-status detection are implemented.

## 👤 Author

**Subrat Sahoo**  
IIT Bombay — Engineering Physics

GitHub: https://github.com/Subrat-1911

---

⭐ If you find the project useful, consider giving the repository a star.
