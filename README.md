# Async CSV Export Service

## Overview

This project implements an asynchronous CSV export service using Node.js and PostgreSQL. The application is designed to handle very large datasets (millions of rows) efficiently without loading all data into memory at once.

The main goal of this project is to demonstrate streaming data processing, asynchronous I/O, background job handling, and containerized deployment using Docker.

---

## Features

* Streams millions of database rows to a CSV file
* Uses PostgreSQL as the data source
* Implements memory-efficient data streaming
* Supports background export job processing
* Dockerized setup with Docker Compose
* Database seeding using init.sql
* Unit and integration tests included

---

## Tech Stack

* Node.js (ES Modules)
* Express
* PostgreSQL
* pg (Node PostgreSQL client)
* Docker & Docker Compose
* Jest (for testing)

---

## Project Structure

```
.
├── app/
│   ├── database.js
│   ├── utils.js
│   ├── server.js
│   └── routes/
├── seeds/
│   └── init.sql
├── exports/
├── tests/
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

## How It Works

1. PostgreSQL is initialized using Docker.
2. The `init.sql` file creates the required tables and inserts sample data.
3. The Node.js application connects to the database using environment variables.
4. When an export request is triggered, data is streamed directly from PostgreSQL.
5. The streamed data is written to a CSV file inside the `exports/` directory.
6. The file is generated without loading all records into memory.

This ensures scalability and prevents memory overflow when working with large datasets.

---

## Environment Configuration

Create a `.env` file in the root directory:
```
# Application Port
API_PORT=8080

# Database Connection
DB_HOST=db
DB_PORT=5432
DB_USER=exporter
DB_PASSWORD=secret
DB_NAME=exports_db
DATABASE_URL=postgresql://exporter:secret@db:5432/exports_db

# Location for storing temporary export files
EXPORT_STORAGE_PATH=/app/exports

```

Make sure the values match those defined in `docker-compose.yml`.

---

## Running the Application

### Step 1: Build and Start Containers

```
docker compose down -v
docker compose up --build
```

This will:

* Build the Node.js image
* Start PostgreSQL
* Run database initialization scripts
* Start the API server

---

### Step 2: Verify Database

You can check the database using:

```
docker exec -it my_postgres psql -U admin -d csv_exports_db
```

Then run:

```
SELECT COUNT(*) FROM users;
```

---

## Running Tests

To run unit and integration tests:

```
npm test
```

Make sure dependencies are installed if running outside Docker:

```
npm install
```

---

## Design Decisions

* Streaming is used instead of fetching all records at once to avoid memory issues.
* Docker Compose is used to simplify local development and environment setup.
* ES Modules are used for modern JavaScript syntax.
* Environment variables are used for configuration flexibility.
* PostgreSQL indexing is applied to improve query performance.

---

## Challenges Faced

* Handling large data exports without memory overflow.
* Fixing Docker volume mounting issues.
* Correctly configuring database environment variables.
* Resolving ES Module vs CommonJS compatibility errors.

---

## Future Improvements

* Add export job status tracking
* Implement queue system (e.g., Bull or Redis)
* Add authentication and role-based access
* Improve error handling and logging
* Add progress tracking for large exports

---

## Conclusion

This project demonstrates how to build a scalable CSV export service capable of handling large datasets efficiently. It highlights the importance of streaming, proper containerization, and correct environment configuration in backend system design.