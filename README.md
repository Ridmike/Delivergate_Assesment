"# TidyDoc - Task Management Application

## Overview

TidyDoc is a modern task management application built with React Native (mobile) and Node.js (backend). It features a beautiful UI with gradient backgrounds, intuitive task organization, and secure user authentication.

## Features

- 🎨 Modern UI with gradient backgrounds and card layouts
- 🔐 Secure authentication system
- 📱 Responsive design for various screen sizes
- 📋 Task management functionality
- 👤 User profile management
- 📲 Side panel navigation
- ⌨️ Keyboard-aware forms
- 🔄 Real-time updates

## Tech Stack

### Mobile App

- React Native
- TypeScript
- Expo
- Zustand (State Management)
- React Navigation
- Expo Linear Gradient
- Expo Blur

### Backend

- Node.js
- Express.js
- MongoDB
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- Expo CLI

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd Delivergates
```

2. Backend Setup

```bash
cd backend
npm install
npm start
```

3. Mobile App Setup

```bash
cd mobile
npm install
expo start
```

## Test Credentials

- Email: kalu@gmail.com
- Password: Kalu1234

## Project Structure

```
├── backend/                 # Backend server
│   ├── src/
│   │   ├── index.js        # Server entry point
│   │   ├── routes/         # API routes
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Custom middleware
│   │   └── lib/           # Utilities
│   └── package.json
│
└── mobile/                  # React Native mobile app
    ├── App.tsx             # App entry point
    ├── components/         # Reusable components
    ├── screens/           # Screen components
    ├── store/             # State management
    ├── assets/            # Images and assets
    └── package.json
```

## Features Overview

### Authentication

- Sign up with email
- Sign in with credentials
- Secure password handling
- JWT token-based auth

### Task Management

- Create new tasks
- Edit existing tasks
- Delete tasks
- Mark tasks as complete
- Filter and search tasks

### User Profile

- View profile information
- Edit profile details
- Logout functionality

## Contributing

Feel free to submit issues and enhancement requests."
