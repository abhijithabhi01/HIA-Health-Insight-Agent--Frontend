# 🩺 HIA - Health Insight Agent (Frontend)

> Modern React frontend for the Health Insight Agent (HIA), an AI-powered platform that helps users understand medical reports through intelligent analysis and conversational AI.

![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-Frontend-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC)
![License](https://img.shields.io/badge/License-MIT-green)

---

# 📖 Overview

Health Insight Agent (HIA) is an AI-powered healthcare platform designed to simplify the understanding of medical reports.

This frontend provides an intuitive user experience for uploading reports, viewing AI-generated insights, interacting with a health chatbot, managing health card applications, and accessing administrative features.

---

# ✨ Features

- 🔐 User Authentication
- 🏠 Responsive Dashboard
- 📄 Upload Medical Reports
- 🤖 AI-powered Medical Report Analysis
- 💬 Interactive Health Chatbot
- 📊 Report History
- 📝 Health Card Application
- 👨‍⚕️ Admin Dashboard
- 📱 Fully Responsive UI
- 🌙 Modern User Interface

---

# 🏗️ Application Architecture

```
                    User
                      │
                      ▼
              React + Vite Frontend
                      │
         React Router Navigation
                      │
      ┌───────────────┼───────────────┐
      │               │               │
      ▼               ▼               ▼

 Authentication   Report Upload   AI Chat

      │               │               │
      └───────────────┼───────────────┘
                      │
                      ▼

           Express Backend APIs

                      │

              MongoDB + AI Services
```

---

# ⚙️ Tech Stack

## Frontend

- React 19
- Vite
- React Router DOM

## Styling

- Tailwind CSS
- CSS Modules

## API Communication

- Axios

## Icons

- React Icons

## Authentication

- JWT Token Authentication

---

# 📂 Project Structure

```
src/

├── assets/
├── components/
│   ├── Navbar
│   ├── Sidebar
│   ├── ProtectedRoute
│   └── Chat Components
│
├── pages/
│   ├── Home
│   ├── Login
│   ├── Register
│   ├── Dashboard
│   ├── Report Upload
│   ├── AI Analysis
│   ├── Chat
│   ├── Health Card
│   └── Admin
│
├── services/
│   └── api.js
│
├── context/
├── hooks/
├── App.jsx
├── main.jsx
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/abhijithabhi01/HIA-Health-Insight-Agent--Frontend.git

cd HIA-Health-Insight-Agent--Frontend
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file.

```env
VITE_API_URL=http://localhost:5000
```

Update the API URL according to your backend deployment.

---

# ▶️ Run Development Server

```bash
npm run dev
```

Application will start at

```
http://localhost:5173
```

---

# 📱 Main Pages

- Home
- Login
- Register
- User Dashboard
- Upload Medical Report
- AI Report Analysis
- Health Chatbot
- Report History
- Health Card Application
- Admin Dashboard

---

# 🔄 User Workflow

1. Register or log in to the application.
2. Upload a medical report (PDF).
3. Wait for AI to process the report.
4. View AI-generated health insights.
5. Ask follow-up questions through the chatbot.
6. Review previous reports and analyses.
7. Apply for a Health Card if required.
8. Administrators can review and manage applications.

---

# 📡 Backend Integration

The frontend communicates with the backend through REST APIs for:

- Authentication
- Medical Report Upload
- AI Analysis
- Chatbot Responses
- Report Management
- Health Card Applications
- Admin Operations

---

# 🎨 UI Highlights

- Responsive Layout
- Protected Routes
- Modern Card-Based Design
- AI Chat Interface
- Dashboard Analytics
- Mobile-Friendly Navigation
- Clean Healthcare-Themed Design

---

# 🔒 Security

- JWT Authentication
- Protected Routes
- Secure API Requests
- Input Validation
- Environment Variable Configuration

---

# 👨‍💻 Author

**Abhijith S**

AI Developer | Full Stack Developer

- GitHub: https://github.com/abhijithabhi01
- LinkedIn: https://www.linkedin.com/in/abhijith-s-5138a724b

---

## ⭐ Support

If you like this project, please consider giving it a **Star ⭐** on GitHub.

Your support helps improve the project and encourages future development.
