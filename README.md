# Student Expense Tracker — PocketWise

**Repository:** https://github.com/santhusf0507-lab/FSTAAT1

PocketWise is a student expense tracker built with React, Vite, Node.js, Express, and MongoDB-compatible storage. It helps students record expenses, monitor monthly budgets, and review spending by category.

## Features
- Add, edit, and delete expense records
- Track amount, category, date, payment method, and notes
- Dashboard with monthly totals and budget progress
- Search and category filtering
- Category-wise analytics and recent spending chart
- Export filtered transactions as CSV
- Responsive React interface
- Express REST API with Mongoose model validation
- Temporary in-memory demo mode when MongoDB is not configured

## Technology stack
- Frontend: React, Vite, Recharts, CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose (optional for demo mode)
- Version control: Git and GitHub

## Project structure
```text
FSTAAT1/
├── backend/
│   ├── models/Expense.js
│   ├── routes/expenses.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── components/ExpenseForm.jsx
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── screenshots/
├── AAT1_Report.pdf
├── .gitignore
└── README.md
```

## Requirements
- Node.js 18 or newer
- npm
- MongoDB locally or a MongoDB Atlas connection string for persistent storage

## Run the backend
```bash
cd backend
npm install
```
Copy `.env.example` to `.env` and set `MONGODB_URI` if using MongoDB. Then run:
```bash
npm run dev
```
The API runs at `http://localhost:5000` by default. Without `MONGODB_URI`, the server uses temporary in-memory storage; records are cleared when the server restarts.

## Run the frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the local URL printed by Vite, usually `http://localhost:5173`.

To configure a different API address, create `frontend/.env`:
```text
VITE_API_URL=http://localhost:5000
```

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API/storage status |
| GET | `/api/expenses` | List expenses; supports search/category/month filters |
| POST | `/api/expenses` | Create an expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |
| GET | `/api/analytics?month=YYYY-MM` | Monthly totals and category summary |

## Screenshots and report
The `screenshots/` directory is intended for project interface screenshots. Repository-layout illustrations should be identified as illustrative rather than live GitHub screenshots. The AAT-1 report can be stored as `AAT1_Report.pdf`.

## Security
- Never commit a real `.env` file or database credentials.
- `.gitignore` excludes `.env`, `node_modules`, and generated build output.

## Future enhancements
Authentication, recurring expense reminders, receipt uploads, and deployment can be added later.
