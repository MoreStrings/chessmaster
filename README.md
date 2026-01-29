# ChessMaster – Full Stack Chess Training Platform

This project is a full-stack chess training platform consisting of:
- **Backend**: FastAPI (Python)
- **Frontend**: React + Vite (Node.js)

---

## Prerequisites

Make sure the following are installed on your system:
- **Python 3.9+**
- **Node.js 18+**
- **npm** (comes with Node.js)

---

## How to Run the Project

### Backend Setup (FastAPI)

1. Navigate to the backend directory:
```bash
cd backend
````

2. Create a Python virtual environment:

```bash
python -m venv venv
```

3. Activate the virtual environment:

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

4. Install backend dependencies:

```bash
pip install -r requirements.txt
```

5. Initialize the database:

```bash
python -c "from database import init_db; init_db()"
```

*(Skip this step if the database initializes automatically.)*

6. Start the backend server:

```bash
uvicorn main:app --reload
```

Backend will be available at:

* API Base URL: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

⚠️ Keep this terminal running.

---

### Frontend Setup (React + Vite)

7. Open a new terminal and navigate to the project root:

```bash
cd chessmaster
```

8. Install frontend dependencies:

```bash
npm install
```

9. Start the frontend development server:

```bash
npm run dev
```

Frontend will be available at:

* [http://localhost:5173](http://localhost:5173)

---

## Running the Application

* Backend runs on **port 8000**
* Frontend runs on **port 5173**
* Frontend communicates with backend through REST APIs

Once both servers are running, open the frontend URL in your browser to use the application.

---

## Tech Stack

* FastAPI
* SQLAlchemy
* JWT Authentication
* SQLite
* React
* Vite
* Tailwind CSS
* Stockfish (Chess Engine)

---

## Notes

* Both frontend and backend support hot-reloading during development
* CORS is enabled for frontend-backend communication
* All backend dependencies are listed in `requirements.txt`
* All frontend dependencies are managed via `package.json`
