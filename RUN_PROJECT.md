# How to Run the Project

## Quick Start Commands

### Option 1: Run Both Frontend and Backend (Recommended)

**Terminal 1 - Backend Server:**
```bash
cd "/Users/arjunsingh/Downloads/fresh-cart-hub-main 2/server" && PORT=3000 npm start
```

**Terminal 2 - Frontend Server:**
```bash
cd "/Users/arjunsingh/Downloads/fresh-cart-hub-main 2" && npm run dev
```

### Option 2: Using npm run dev for Backend (Auto-reload)

**Terminal 1 - Backend Server (with auto-reload):**
```bash
cd "/Users/arjunsingh/Downloads/fresh-cart-hub-main 2/server" && PORT=3000 npm run dev
```

**Terminal 2 - Frontend Server:**
```bash
cd "/Users/arjunsingh/Downloads/fresh-cart-hub-main 2" && npm run dev
```

## Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

## Single Command (Background Processes)

If you want to run both in the background from one terminal:

```bash
cd "/Users/arjunsingh/Downloads/fresh-cart-hub-main 2/server" && PORT=3000 npm start & cd "/Users/arjunsingh/Downloads/fresh-cart-hub-main 2" && npm run dev
```

## Notes

- Make sure you have Node.js installed
- Backend runs on port 3000
- Frontend runs on port 5173
- Backend must be running before the frontend can make API calls

