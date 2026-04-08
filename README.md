# InvestWise

InvestWise is a full-stack mutual fund and financial activity platform built with a React frontend and a Spring Boot backend. It combines investor portfolio tracking, fund discovery, advisor booking, analyst fund management, and admin controls in one product surface.

The app now also exposes a cleaner financial activity experience with:

- summary cards for wallet balance, income, and expenses
- a time-based balance trend chart
- a categorical spending breakdown chart
- a searchable, filterable, sortable transactions section
- an insights section with simple financial observations

## Tech Stack

- Frontend: React 18, Vite, React Router, Recharts
- Styling: custom CSS, Magic Bento interactions, Lucide icons
- Backend: Spring Boot 3, Spring Security, JPA / Hibernate
- Database:
  - local: H2 in-memory
  - deployed: Render service configuration
- Authentication: JWT, Google Sign-In

## Project Structure

```text
frontend/   React + Vite application
backend/    Spring Boot API
render.yaml Render deployment blueprint
```

## Features

### Investor Experience

- dashboard with financial summaries, charts, and insights
- fund explorer and fund detail pages
- portfolio holdings and transaction history
- wallet funding, buy, sell, and advisor booking flows

### Advisor Experience

- advisor directory and profile pages
- appointment queue
- availability slot management

### Analyst Experience

- analyst dashboard
- fund data management
- create, edit, delete, and import fund records

### Admin Experience

- admin dashboard
- user management
- role updates, suspension, reactivation, and deletion

## Assignment Mapping

### 1. Dashboard Overview

Implemented on the investor dashboard:

- `Wallet Balance`
- `Income`
- `Expenses`
- `Risk Score`
- `Balance Trend` time-based chart
- `Spending Breakdown` category-based chart

Relevant files:

- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/DashboardPage.css`

### 2. Transactions Section

Implemented in the portfolio transactions view:

- date
- amount
- category
- transaction type mapped as income or expense
- search
- category filter
- type filter
- sort by date or amount

Relevant files:

- `frontend/src/pages/Portfolio.jsx`
- `frontend/src/pages/PortfolioPage.css`
- `backend/src/main/java/com/fsad/mutualfund/controller/TransactionController.java`

### 3. Basic Role-Based UI

The application uses real role-aware UI instead of a simple mock role toggle:

- Investor
- Advisor
- Analyst
- Admin

Role-specific pages and navigation are controlled through the authenticated user session, and the login page includes quick-fill demo credentials for each role so reviewers can switch contexts quickly without needing a frontend-only mock toggle.

The admin can toggle the roles of each user under the admin panel, and the backend enforces role-based access control on all relevant endpoints.

### 4. Insights Section

Implemented on the investor dashboard:

- highest spending category
- monthly comparison
- a useful observation based on net activity

### 5. State Management

State is handled with:

- React Context for authentication and session state
- component-level state and derived `useMemo` data for transactions, filters, charts, and page-specific interactions

Relevant files:

- `frontend/src/context/AuthContext.jsx`
- page-level components such as `Dashboard.jsx` and `Portfolio.jsx`

### 6. UI / UX Expectations

Implemented across the app:

- responsive layouts
- polished dashboard and workspace styling
- empty states
- loading states
- modal and table interactions

## Running Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs by default on:

```text
http://localhost:5173
```

### Backend

```bash
cd backend
mvn spring-boot:run
```

The backend runs by default on:

```text
http://localhost:8080
```

## Environment Variables

### Frontend

Set in `frontend/.env` or your deployment platform:

```text
VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Backend

Set in your environment or deployment platform:

```text
SPRING_PROFILES_ACTIVE=render
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
CORS_ORIGINS=http://localhost:5173
```

## Demo Accounts

The login page includes quick-fill demo accounts for:

- Investor
- Advisor
- Analyst
- Admin

This is the recommended way to review role-specific behavior during evaluation.

## Notes and Assumptions

- financial transaction categories are derived from the current domain transaction model
- the assignment view is integrated into the wider mutual-fund platform rather than being a separate standalone app
- local development uses H2 for simplicity

## Build Verification

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
mvn -q -DskipTests compile
```
