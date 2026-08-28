# FarmFresh Direct — Farm-to-Doorstep Delivery & Subscription Platform

> Centralized platform that digitizes the complete order lifecycle — catalog browsing, subscription management, zone-based dispatch routing, harvest-to-pack fulfillment workflow, delivery tracking, and quality resolution — with AI-assisted demand/supply mismatch detection to help delivery-ops staff catch shortfalls before the morning cutoff.

---

## 📖 Setup Instructions

For step-by-step instructions on setting up and running the project locally, please read **[SETUP.md](./SETUP.md)**.

### Quick Start:

1. **Database Setup** (Choose one):
   - **MongoDB Atlas (No Docker)**: Create a free cluster on [mongodb.com/atlas](https://www.mongodb.com/atlas), and add your connection string to `backend/.env` as `MONGODB_URI`.
   - **Docker (Local)**: Run `docker compose up -d` in project root to spin up a local MongoDB instance.
   - **Local MongoDB**: Install MongoDB Community Server and run it as `mongod`, then set `MONGODB_URI=mongodb://localhost:27017/farmfresh` in `backend/.env`.

2. **Start Servers**:
   ```bash
   # 1. Start Backend (Terminal 1)
   cd backend
   npm install
   npm run dev

   # 2. Start Frontend (Terminal 2)
   cd frontend
   npm install
   npm run dev
   ```

Open `http://localhost:5173` in your browser.

---

## 🔑 Pre-Configured Demo Accounts (Password: `password123`)

- **Customer**: `customer@farmfresh.in`
- **Delivery-Ops — Lucknow Gomti Nagar Zone**: `deliveryops.lucknow@farmfresh.in`
- **Delivery-Ops — Delhi Connaught Place Zone**: `deliveryops.delhi@farmfresh.in`
- **System Administrator**: `admin@farmfresh.in`

---

## 🌟 Key Modules Implemented

- **Phase 1: Project Foundation** — Express backend, React+Vite frontend, MongoDB (Mongoose) schema, shared dashboard shell, design system.
- **Phase 2: Authentication & RBAC** — 3 system roles (`CUSTOMER`, `DELIVERY_OPS`, `ADMIN`), JWT authentication, protected routes, user profile management.
- **Phase 3: Delivery Zone & Delivery-Ops Management** — Zone CRUD, pincode/region mapping with cutoff & dispatch-deadline configuration, Admin-created Delivery-Ops accounts, zone listing with search/filter.
- **Phase 4: Product Catalog Management** — Product CRUD (fruits, vegetables, milk, dairy), daily stock ceiling & availability toggle, substitution mapping.
- **Phase 5: Ordering Module** — Cutoff-aware checkout flow, "My Orders" list with status tracking, order detail view.

---

For detailed setup instructions, refer to **[SETUP.md](./SETUP.md)**.
