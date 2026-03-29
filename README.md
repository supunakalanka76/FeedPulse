# FeedPulse — AI-Powered Product Feedback Platform

FeedPulse is a lightweight internal tool that helps teams collect product feedback and feature requests, then uses **Google Gemini AI** to automatically **categorize, prioritize, and summarize** them—so product teams can quickly understand what to build next.

---

## Overview

Product feedback often lives across emails, chats, support tickets, and spreadsheets. FeedPulse centralizes feedback into a single system and turns raw input into actionable insights with AI-powered classification and summarization.

**Use cases**
- Collect feature requests from users/customers
- Triage and prioritize feedback automatically
- Generate summaries for product planning and roadmap discussions

---

## Features

- **Feedback collection**: Capture product feedback and feature requests in one place
- **AI categorization**: Automatically groups feedback into meaningful categories
- **AI prioritization**: Helps identify high-impact requests (based on volume/importance signals)
- **AI summarization**: Generates concise summaries for quick review
- **Secure API**: Authentication with JWT, password hashing with bcrypt
- **Operational safety**: Rate limiting, security headers, request logging

---

## Tech Stack

### Frontend
- **Next.js** (React + TypeScript)
- **Tailwind CSS**
- **Axios**

### Backend
- **Node.js + Express** (TypeScript)
- **MongoDB + Mongoose**
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, Express Rate Limit
- **AI**: Google Gemini (`@google/generative-ai`)
- **Logging**: Morgan
- **Config**: dotenv

---

## System Architecture

```
┌───────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                    │
│  UI for submitting feedback + viewing AI insights         │
└───────────────────────────────────────────────────────────┘
                          │  HTTP (REST)
                          ▼
┌───────────────────────────────────────────────────────────┐
│                      Backend (Express)                    │
│  Auth (JWT) • Feedback APIs • AI processing (Gemini)      │
└───────────────────────────────────────────────────────────┘
                │                         │
                │ Mongoose                │ Google Gemini API
                ▼                         ▼
┌─────────────────────────────┐     ┌───────────────────────┐
│      MongoDB (Database)     │     │  Gemini AI (External)  │
│ feedback, users, metadata   │     │ classify/summarize     │
└─────────────────────────────┘     └───────────────────────┘
```

---

## Project Folder Structure

> This is the expected high-level structure for this monorepo (frontend + backend).  
> Folder/file names may vary depending on your implementation.

```
FeedPulse/
├── backend/
│   ├── src/
│   │   ├── server.ts              # App entry point
│   │   ├── routes/                # API routes
│   │   ├── controllers/           # Request handlers
│   │   ├── services/              # Business logic (Gemini processing, etc.)
│   │   ├── models/                # Mongoose models (User, Feedback, etc.)
│   │   ├── middleware/            # Auth, validation, rate limit, error handling
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                       # Not committed (local)
│
├── frontend/
│   ├── app/                       # Next.js App Router pages
│   ├── components/                # UI components
│   ├── lib/                       # API client, helpers
│   ├── public/                    # Static assets
│   ├── package.json
│   └── .env.local                 # Not committed (local)
│
├── README.md
└── .gitignore
```

---

## Installation

### Prerequisites
- **Node.js** (LTS recommended)
- **npm** (or pnpm/yarn)
- **MongoDB** (local or hosted)
- **Google Gemini API key**

### Clone the repository
```bash
git clone https://github.com/supunakalanka76/FeedPulse.git
cd FeedPulse
```

### Install dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

---

## Configuration

> This repo may not include `.env.example` yet. Create the following env files locally.

### Backend environment (`backend/.env`)
Create `backend/.env`:

```env
PORT=4000
MONGO_URI=mongodb+srv://<db_username>:<password>@cluster0.yhoye6q.mongodb.net/feedpluse?retryWrites=true&w=majority

JWT_SECRET=replace_with_a_strong_secret

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Optional (useful for CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend environment (`frontend/.env.local`)
Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

> If your backend serves routes under a prefix like `/api`, use:
> `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api`

---

## Run the Application

### Development mode

#### Start backend
```bash
cd backend
npm run dev
```
Backend should run on: `http://localhost:4000`

#### Start frontend (new terminal)
```bash
cd frontend
npm run dev
```
Frontend should run on: `http://localhost:3000`

### Production mode (optional)

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm start
```

---

## Screenshots

Add screenshots to a folder like `docs/screenshots/` and link them here.

Example:
- `docs/screenshots/dashboard.png`
- `docs/screenshots/feedback-form.png`

```md
![Dashboard](docs/screenshots/dashboard.png)
![Feedback Form](docs/screenshots/feedback-form.png)
```

---

## Testing

> If you haven’t added tests yet, this section can remain as a placeholder.

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

---

## Contribution

Contributions are welcome.

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by Supun Akalanka**

[![GitHub](https://img.shields.io/badge/GitHub-supunakalanka76-181717?style=flat&logo=github)](https://github.com/supunakalanka76)

---

