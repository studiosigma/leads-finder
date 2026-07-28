# Backend Structure for Leads Finder (Async/Asyncio)

## 1. Setup Backend Orchestration (Task #5)
- Using FastAPI for high-performance API endpoints.
- Celery + Redis for asynchronous background tasks.
- Folder structure defined as:
  ```text
  /backend
    /app
      /api/routes       # Endpoint definitions
      /core             # Config, logging
      /services
        /scrapers       # Modular scrapers
        /pipeline       # Data cleaning
        /queue          # Celery configuration
      main.py
  ```

## 2. Implement Modular Scrapers (Task #6)
- Google Maps, Google Search, Website Crawlers.
- Asynchronous execution within Celery tasks.

## 3. Implement Data Cleaning Pipeline (Task #7)
- Standardize data formats (email, phone).
- Deduplicate findings.
- Store in Supabase/PostgreSQL.
