# Micro-DB

A lightweight relational database management system built with Node.js, featuring a web interface, REST API, and interactive REPL.


## Overview

Micro-DB is an educational, lightweight relational database management system designed to demonstrate core database concepts. It provides a simplified SQL interface with JSON-based storage, making it perfect for learning, prototyping, and small-scale applications.


## Features

### Core Features
-  **SQL Support**: CREATE TABLE, INSERT, SELECT, UPDATE, DELETE
-  **Data Types**: TEXT, NUMBER, INTEGER, BOOLEAN, DATE
-  **WHERE Clauses**: Conditional queries with equality operators
-  **Table Management**: CREATE, DROP, DESCRIBE tables
-  **Query Results**: Formatted output with error handling


## Installation

### Prerequisites
- Node.js 14.0 or higher
- npm or yarn package manager

### Setup Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd /path/to/micro-db
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   npm start
   ```

---

## Quick Start

### Option 1: Web Interface (Recommended for beginners)

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. Use the intuitive web interface to:
   - Create tables
   - Insert data
   - Run queries
   - View and manage tables

### Option 2: Interactive REPL

1. Start the REPL:
   ```bash
   npm run repl
   ```

2. Type SQL commands directly:
   ```sql
   micro-db> CREATE TABLE users (id INTEGER, name TEXT, email TEXT);
   micro-db> INSERT INTO users (id, name, email) VALUES (1, 'John', 'john@example.com');
   micro-db> SELECT * FROM users;
   micro-db> exit
   ```

### Option 3: REST API

Make HTTP requests to interact with the database:

```bash
# Execute a query
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT * FROM users"}'

# List all tables
curl http://localhost:3000/api/tables

# Get table data
curl http://localhost:3000/api/users
```

---

## Usage

### Web Interface

The web interface provides a user-friendly way to manage your database:

#### Tabs Overview

1. **SQL Query**: Execute custom SQL queries
2. **Tables**: View and manage database tables
3. **Create Table**: Visual table creation wizard
4. **Help**: SQL syntax reference and examples

#### Key Features

- **Syntax Highlighting**: Color-coded query results
- **Tab Navigation**: Easy switching between views
- **Real-time Feedback**: Instant query execution results
- **Keyboard Shortcuts**: Ctrl/Cmd + Enter to execute queries
- **Responsive Design**: Works on desktop and mobile

### REST API

#### Base URL
```
http://localhost:3000/api
```

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/query` | Execute SQL query |
| GET | `/api/tables` | List all tables |
| GET | `/api/describe/:tableName` | Get table schema |
| GET | `/api/:tableName` | Get all table data |
| GET | `/api/health` | Health check |


### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## License

This project is free to use for anyone.



