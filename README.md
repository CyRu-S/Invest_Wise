# InvestWise Frontend

This repository now contains the React frontend for InvestWise. The backend has been split into its own repository:

- Backend repo: `https://github.com/CyRu-S/Invest_Wise_Backend`

## Tech Stack

- React 18
- Vite
- React Router
- Recharts
- Custom CSS
- Lucide React

## Project Structure

```text
frontend/  React + Vite application
```

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

The frontend runs by default on `http://localhost:5173`.

## Environment Variables

Set in `frontend/.env` or your deployment platform:

```text
VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

For deployed environments, point `VITE_API_URL` at the Render backend URL once the backend is live.
