# BookVerse Platform

A full-stack book review platform with a modern React frontend and a Node.js/Express + PostgreSQL backend.

---

## Live Demo
Deployed Link: https://book-review-platform-red.vercel.app/


## 📚 Features

- Browse, search, and filter classic books
- Featured books and book details pages
- Submit and view reviews
- User authentication (login/signup)
- User profile with edit functionality
- Responsive, modern UI with Tailwind CSS
- RESTful API backend

---

## 🖥️ Frontend (React)

### Tech Stack

- React (with hooks)
- React Router
- Axios
- Tailwind CSS

### Structure

```
frontend/
│
├── public/
├── src/
│   ├── api/             # API helpers
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components (Home, Book, Login, Signup, Profile)
│   ├── App.jsx
│   └── main.jsx
└── README.md
```

### Setup

```bash
cd frontend
npm install
npm run dev
```

- Runs at [http://localhost:3000](http://localhost:3000)
- API base URL: `http://localhost:4000` (change in `/src/api/` if needed)

### Key Pages

- `/` — Home (featured books, search, stats)
- `/book/:id` — Book details, content, reviews
- `/profile` — User profile (view/edit)
- `/login` — Login
- `/signup` — Signup

---

## 🛠️ Backend (Node.js, Express, PostgreSQL)

### Tech Stack

- Node.js
- Express
- PostgreSQL + Prisma
- JWT (for authentication)

### Structure

```
backend/
│
├── prisma/        # Prisma schema and PostgreSQL models
├── routes/        # Express route handlers
├── app.js         # Main Express app
└── README.md
```

### Setup

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm start
```

- Runs at [http://localhost:4000](http://localhost:4000)
- Configure `DATABASE_URL` in `.env` with your PostgreSQL connection string

### API Endpoints

- `GET /books` — List all books (with pagination)
- `GET /books/:id` — Get book details
- `POST /books` — Add a new book (admin only)
- `GET /reviews` — Get reviews for a book
- `POST /reviews` — Submit a review
- `GET /users/:id` — Get user profile
- `PUT /users/:id` — Update user profile

### Notes

- Uses JWT for protected routes (login required for reviews/profile update)
- Data validation and error handling included

---

## 🧑‍💻 Development Notes

- **Frontend:**  
  - Uses React hooks for state management  
  - User info stored in localStorage after login  
  - Error and loading states handled throughout

- **Backend:**  
  - Modular route/controller structure  
  - Prisma for PostgreSQL access and schema validation
  - Proper RESTful API design

---

## 📄 License

This project is for educational/demo purposes.

---
