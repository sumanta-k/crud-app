# CRUD Application - Node.js + Express + MongoDB

A complete CRUD (Create, Read, Update, Delete) application built with Node.js, Express.js, and MongoDB. This application demonstrates all four fundamental database operations with a modern, responsive web interface.

## 🚀 Features

- **Create**: Add new tasks with title, description, and status
- **Read**: View all tasks with real-time data from MongoDB
- **Update**: Edit existing tasks with inline editing
- **Delete**: Remove tasks with confirmation dialog

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js]
- [MongoDB]

## 🔧 Installation & Setup

### 1. Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd <into-cloned-repo>

```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

### 4. Create Project Structure

Create the following folder structure:

```
crud-app
├── server.js
├── package.json
├── README.md
└── public/
    └── index.html
```

### 5. Add the Files

1. **server.js** - Main Node.js server file
2. **package.json** - Node.js dependencies and scripts
3. **public/index.html** - Frontend HTML file

### 6. Install Dependencies

Run the following command to install all required packages:

```bash
npm install express mongoose cors
```

### 7. Start the Application

```bash
# For development (with auto-restart)
npm run dev

# For production
npm start
```

## 🌐 Accessing the Application

Once the server is running:

1. Open your web browser
2. Navigate to `http://localhost:3000`
3. You should see the Task Manager interface

## 📊 API Endpoints

The application provides the following REST API endpoints:

| Method | Endpoint         | Description                      |
| ------ | ---------------- | -------------------------------- |
| GET    | `/api/health`    | Check server and database status |
| GET    | `/api/tasks`     | Get all tasks                    |
| GET    | `/api/tasks/:id` | Get a specific task              |
| POST   | `/api/tasks`     | Create a new task                |
| PUT    | `/api/tasks/:id` | Update an existing task          |
| DELETE | `/api/tasks/:id` | Delete a task                    |

> you can try out these endpoints with curl command
